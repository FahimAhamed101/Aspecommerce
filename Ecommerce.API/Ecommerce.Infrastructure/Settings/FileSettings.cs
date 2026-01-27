namespace Ecommerce.Infrastructure.Settings
{
    public class FileSettings
    {
        public const string ImagesPath = "wwwroot/images";
        public const string AllowedExtensions = ".jpg,.jpeg,.png,.gif,.bmp,.webp";
        public const int MaxFileSizeInMB = 5;
        public const int MaxFileSizeInBytes = MaxFileSizeInMB * 1024 * 1024;
        public const string BaseUrl = "https://localhost:7045";
    }
}