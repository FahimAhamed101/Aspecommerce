using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.Helpers
{
    public class AllowedExtensionsAttribute : ValidationAttribute
    {
        private readonly string[] _allowedExtensions;

        public AllowedExtensionsAttribute(string allowedExtensions)
        {
            _allowedExtensions = allowedExtensions.Split(',');
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is IFormFile file)
            {
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!_allowedExtensions.Contains(extension))
                {
                    return new ValidationResult($"Only {string.Join(", ", _allowedExtensions)} files are allowed.");
                }
            }
            return ValidationResult.Success;
        }
    }
}