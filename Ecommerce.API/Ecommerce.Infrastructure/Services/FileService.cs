using Ecommerce.Core.Interfaces;
using Ecommerce.Infrastructure.Settings;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _imagesRootPath; // wwwroot/images

        public FileService(IWebHostEnvironment env)
        {
            _env = env;
            // Use WebRootPath if available, otherwise fallback to ContentRootPath + wwwroot
            var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            _imagesRootPath = Path.Combine(webRoot, FileSettings.ImagesPath);
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file is null)
                throw new ArgumentNullException(nameof(file));

            if (string.IsNullOrWhiteSpace(folderName))
                throw new ArgumentNullException(nameof(folderName));

            var folderPath = Path.Combine(_imagesRootPath, folderName);

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(folderPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return Path.Combine(FileSettings.ImagesPath, folderName, fileName).Replace("\\", "/");
        }

        public bool DeleteFile(string relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
                return false;

            // Combine with wwwroot
            var filePath = Path.Combine(_env.WebRootPath, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (!File.Exists(filePath))
                return false;

            File.Delete(filePath);
            return true;
        }

        public bool IsValidFile(IFormFile file)
        {
            if (file is null || file.Length == 0)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            return FileSettings.AllowedExtensions.Contains(extension);
        }

        public string GetFileUrl(string fileName, string folderName)
        {
            if (string.IsNullOrWhiteSpace(fileName) || string.IsNullOrWhiteSpace(folderName))
                return string.Empty;

            return $"{FileSettings.BaseUrl}/{FileSettings.ImagesPath}/{folderName}/{fileName}";
        }
    }
}