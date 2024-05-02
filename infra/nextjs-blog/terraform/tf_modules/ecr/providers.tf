# ----------------------------------------------------------------------------------------------------------------------
# Terraform config
#
# Note:
#   With the use of Terragrunt, no specific `provider {}` or `remote_state {}` blocks need be defined.
#   The `terragrunt.hcl` file in the root of the `environments/` directory generates and caches the necessary backend
#   and provider configuration with each run based on the environment in which Terragrunt is executed.
# ----------------------------------------------------------------------------------------------------------------------

terraform {
  # This is the minimum Terraform versions that this module was tested against
  required_version = "~> 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.7.0"
    }
  }
}
