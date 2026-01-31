using Ecommerce.Core.Interfaces;
using Ecommerce.Infrastructure.Constants;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Infrastructure.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public PermissionService(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<HashSet<string>> GetRolePermissionsAsync(IdentityRole role)
        {
            var claims = await _roleManager.GetClaimsAsync(role);
            return claims
                .Where(c => c.Type == Permissions.ClaimType)
                .Select(c => c.Value)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        public async Task RemoveAllPermissionsAsync(IdentityRole role)
        {
            var claims = await _roleManager.GetClaimsAsync(role);
            var permissionClaims = claims.Where(c => c.Type == Permissions.ClaimType).ToList();

            foreach (var claim in permissionClaims)
            {
                await _roleManager.RemoveClaimAsync(role, claim);
            }
        }

        public async Task AddPermissionsAsync(IdentityRole role, IEnumerable<string> permissions)
        {
            var existing = await GetRolePermissionsAsync(role);

            foreach (var permission in permissions)
            {
                if (existing.Contains(permission))
                    continue;

                await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim(
                    Permissions.ClaimType,
                    permission));
            }
        }
    }
}
