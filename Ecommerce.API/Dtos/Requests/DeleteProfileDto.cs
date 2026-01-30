using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.Dtos.Requests
{
    public class DeleteProfileDto
    {
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}
