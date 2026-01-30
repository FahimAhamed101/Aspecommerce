using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.Dtos.Requests
{
    public class ChangePasswordDto
    {
        [Required]
        [DataType(DataType.Password)]
        public string OldPassword { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
