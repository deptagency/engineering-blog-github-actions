# The root terragrunt.hcl containing the configuration applicable to all environments (dev, qa, prod)

# Locals are named constants that are reusable within the configuration.
# Loading the common and env variables
locals {
  # Automatically load variables common to all environments (dev, qa, prod)
  common_vars = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))

  # Automatically load environment -level variables
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl", "env.hcl"))

  # Merge all the variables to allow overriding local variables
  merged_local_vars = merge(
    local.common_vars.locals,
    local.env_vars.locals,
  )

  # Define as Terragrunt local vars to make it easier to use and change
  project_name     = local.merged_local_vars.project_name
  app_id           = local.merged_local_vars.app_id
  environment_name = local.merged_local_vars.environment_name
  aws_region       = local.merged_local_vars.aws_region
}

# Using the common and env variables as input for the Terraform modules
# Replaces duplicate terraform.tfvars files and Terraform modules configuration
inputs = local.merged_local_vars

# Common Terraform remote state that can be reused by all modules
# Replaces duplicate providers.tf terraform backend
remote_state {
  backend = "s3"

  # No need to create the tfstate via terraform-infra module
  # If the S3 and DynamoDB resource does not exist, Terragrunt will create it.
  # Notice you can use Terragrunt local variables in the backend config.
  # In Terraform, variable usage is not allowed in the backend config.
  #
  # In Terragrunt, the path_relative_to_include() function can ensure that the backed key is dynamic.
  # In Terraform, the unique backend key must be hard-coded for each configuration.
  config = {
    bucket         = "${local.environment_name}-${local.app_id}-tfstate-s3"
    region         = local.aws_region
    key            = "${path_relative_to_include()}/terraform.tfstate"
    dynamodb_table = "${local.environment_name}-${local.app_id}-tfstate-dynamodb"
    encrypt        = true
  }
  generate = {
    path      = "terragrunt-generated-backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# Generate an AWS provider block
# In Terraform, changing these provider settings and versions results in changing multiple providers.tf
# In Terragrunt, this root terragrunt.hcl is the only place you need to make the change
generate "provider" {
  # This is using the Terraform built-in override file functionality
  # https://www.terraform.io/language/files/override
  path      = "providers_override.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
# In a professional setting, a hard-pin of terraform versions ensures all
# team members use the same version, reducing state conflict
terraform {
  required_version = "1.8.2"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.47.0"
    }
  }
}
provider "aws" {
  region = "${local.aws_region}"

  # See info about default_tags at
  # https://blog.rocketinsights.com/best-practices-for-terraform-aws-tags/
  default_tags {
    tags = {
      project     = "${local.project_name}"
      app-id      = "${local.app_id}"
      environment = "${local.environment_name}"

      // Knowing who applied the Terraform change is useful for auditing and debugging
      terragrunt-caller-id = "${get_aws_caller_identity_arn()}"

      // This tag helps AWS UI users discover what
      // Terragrunt git repo and directory to modify
      // No need for an awkward regex like in Terraform
      terragrunt-base-path = "${local.project_name}/${get_path_from_repo_root()}"
    }
  }
}
EOF
}

terraform {
  # Terragrunt extra_arguments sets Terraform options in one place
  # To do this in Terraform would require a custom bash script

  # Force Terraform to run with increased parallelism
  extra_arguments "parallelism" {
    commands  = get_terraform_commands_that_need_parallelism()
    arguments = ["-parallelism=15"]
  }
  # Force Terraform to keep trying to acquire a lock for up to 3 minutes if someone else already has the lock
  extra_arguments "retry_lock" {
    commands  = get_terraform_commands_that_need_locking()
    arguments = ["-lock-timeout=3m"]
  }

  # Hooks are external programs that will run before, after, or on error Terragrunt execution
  # In the real world, you can use before,after,error hooks to post on Slack or CloudWatch to
  # monitor environment changes
  before_hook "before_plan_apply_hook" {
    commands = ["plan", "apply"]
    execute  = ["echo", "START Terragrunt execution"]
  }
  after_hook "after_plan_apply_hook" {
    commands = ["plan", "apply"]
    execute  = ["echo", "FINISH Terragrunt execution"]
  }

  before_hook "before_destroy_hook" {
    commands = ["destroy"]
    execute  = ["echo", "START Terragrunt destroy"]
  }
  after_hook "after_destroy_hook" {
    commands = ["destroy"]
    execute  = ["echo", "FINISH Terragrunt destroy"]
  }

  error_hook "on_error_hook" {
    commands = ["plan", "apply", "destroy"]
    execute  = ["echo", "ERROR running Terragrunt"]
    on_errors = [
      ".*",
    ]
  }

}

# Terragrunt will automatically retry the underlying Terraform commands if it fails
# You can configure custom errors to retry in the retryable_errors list
# and you can specify how ofter the retries occur
//retryable_errors = [
//  "(?s).*Error installing provider.*tcp.*connection reset by peer.*",
//  "(?s).*ssh_exchange_identification.*Connection closed by remote host.*"
//]
retry_max_attempts       = 3
retry_sleep_interval_sec = 5
