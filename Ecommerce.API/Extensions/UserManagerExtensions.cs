using System.Security.Claims;
using Ecommerce.Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.API.Extensions
{
    public static class UserManagerExtensions
    {
        public static async Task<ApplicationUser?> FindUserByClaimsPrincipalAsync(
            this UserManager<ApplicationUser> userManager,
            ClaimsPrincipal user)
        {
            var email = user?.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await userManager.FindByEmailAsync(email);
        }

        public static async Task<ApplicationUser?> FindUserByClaimsPrincipalWithAddressAsync(
            this UserManager<ApplicationUser> userManager,
            ClaimsPrincipal user)
        {
            var email = user?.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await userManager.Users
                .Include(u => u.Address)
                .SingleOrDefaultAsync(u => u.Email == email);
        }
    }
}
