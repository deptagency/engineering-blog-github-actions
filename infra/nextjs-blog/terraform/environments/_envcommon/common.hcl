# Common configuration variables applicable to all environments (dev, qa, prod)
# Replaces duplicate Terraform locals.tf in all Terraform infrastructure code
#
# The two slashes in the paths below are intentional.
# The first slash is used to separate the repo URL from the path to the module.
# The second slash is used to separate the path to the module from the path to the module source file.

locals {
  base_module_source_url       = "github.com/deptagency/engineering-blog-github-actions//infra/nextjs-blog/terraform/tf_modules"
  base_module_source_local_dir = "${get_terragrunt_dir()}/../../tf_modules"
}