using System.ComponentModel.DataAnnotations;
using Ecommerce.API.Helpers;
using Ecommerce.Infrastructure.Settings;

namespace Ecommerce.API.Dtos.Requests
{
    public class ProductUpdateDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        [Required]
        public int ProductBrandId { get; set; }

        [Required]
        public int ProductTypeId { get; set; }

        [AllowedExtensions(FileSettings.AllowedExtensions)]
        [MaxFileSize(FileSettings.MaxFileSizeInBytes)]
        public IFormFile? Image { get; set; }

        public bool RemoveImage { get; set; } = false;
    }
}