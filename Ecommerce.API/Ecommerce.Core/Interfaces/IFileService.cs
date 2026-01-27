namespace Ecommerce.Core.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName);
        bool DeleteFile(string fileName);
        bool IsValidFile(IFormFile file);
        string GetFileUrl(string fileName, string folderName);
    }
}