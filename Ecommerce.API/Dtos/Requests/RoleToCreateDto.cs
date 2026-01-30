using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.Dtos.Requests
{
    public class RoleToCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
