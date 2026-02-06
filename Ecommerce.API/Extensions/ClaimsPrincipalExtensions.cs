using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Ecommerce.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string? RetrieveEmailFromPrincipal(this ClaimsPrincipal user)
        {
            return user?.Claims
                .FirstOrDefault(x => x.Type == ClaimTypes.Email || x.Type == JwtRegisteredClaimNames.Email)
                ?.Value;
        }

        public static string? RetrieveUserIdFromPrincipal(this ClaimsPrincipal user)
        {
            return user?.Claims
                .FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier || x.Type == JwtRegisteredClaimNames.NameId)
                ?.Value;
        }
    }
}
