# Configuration variables for the dev environment
# Replaces duplicate Terraform environment terraform.tfvars in all Terraform infrastructure code
# Seeing all the dev environment variables in one place make it easier to
# understand and configure the whole environment
locals {
  project_name = "engineering-blog-github-actions"
  app_id       = "nextjs-blog"
  app_prefix   = "${local.environment_name}-${local.app_id}"

  environment_name = "dev"
  aws_region       = "us-east-1"

  ecr_repo_name = "nextjs-blog"
  force_delete  = true
}