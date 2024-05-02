# ----------------------------------------------------------------------------------------------------------------------
# ECR variables
# ----------------------------------------------------------------------------------------------------------------------

variable "ecr_repo_name" {
  type        = string
  description = "List of ECR repo names to create"
}

variable "is_image_mutable" {
  type        = bool
  description = "(Optional) If true, the image tag is mutable. Default to true"
  default     = true
}

variable "force_delete" {
  type        = bool
  description = "(Optional) If true, will delete the repository even if it contains images. Defaults to false"
  default     = false
}

variable "scan_on_push" {
  type        = bool
  description = "(Optional) Indicates whether images are scanned after being pushed to the repository (true) or not scanned (false). Defaults to false."
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}