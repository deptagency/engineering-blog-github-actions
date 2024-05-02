## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.5 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 5.7.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | >= 5.7.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_ecr_repository.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_ecr_repo_names"></a> [ecr\_repo\_names](#input\_ecr\_repo\_names) | List of ECR repo names to create | `list(string)` | n/a | yes |
| <a name="input_force_delete"></a> [force\_delete](#input\_force\_delete) | (Optional) If true, will delete the repository even if it contains images. Defaults to false | `bool` | `false` | no |
| <a name="input_is_image_mutable"></a> [is\_image\_mutable](#input\_is\_image\_mutable) | (Optional) If true, the image tag is mutable. Default to true | `bool` | `true` | no |
| <a name="input_scan_on_push"></a> [scan\_on\_push](#input\_scan\_on\_push) | (Optional) Indicates whether images are scanned after being pushed to the repository (true) or not scanned (false). Defaults to false. | `bool` | `false` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | n/a | `map(string)` | `{}` | no |

## Outputs

No outputs.
