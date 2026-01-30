using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.Dtos.Requests
{
    public class SetPasswordDto
    {
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}
