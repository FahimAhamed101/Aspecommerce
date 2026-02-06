using Ecommerce.Core.Entities.Emails;

namespace Ecommerce.Core.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendResetPasswordEmailAsync(string? toEmail, string resetLink);
        Task SendAsync(EmailMessage message);
    }
}
