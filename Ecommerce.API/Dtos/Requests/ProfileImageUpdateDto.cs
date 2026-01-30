using Microsoft.AspNetCore.Http;

namespace Ecommerce.API.Dtos.Requests
{
    public class ProfileImageUpdateDto
    {
        public IFormFile? ProfileImageFile { get; set; }
    }
}
