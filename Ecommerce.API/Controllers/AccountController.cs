using System.Net;
using Ecommerce.API.Dtos.Requests;
using Ecommerce.API.Dtos.Responses;
using Ecommerce.API.Errors;
using Ecommerce.Core.Constants;
using Ecommerce.Core.Entities.Identity;
using Ecommerce.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
namespace Ecommerce.API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService,
            IEmailService emailService,
            IConfiguration config,
            IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _config = config;
            _mapper = mapper;
        }

        [HttpPost("login")]
       
        public async Task<ActionResult<UserDto>> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user is null)
                return Unauthorized(new ApiResponse(StatusCodes.Status401Unauthorized));

            var lockMessage = GetLockMessage(user);
            if (!string.IsNullOrEmpty(lockMessage))
                return BadRequest(new ApiResponse(400, lockMessage));

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);

            if (result.IsLockedOut)
                return BadRequest(new ApiResponse(400,
                    "Your account has been locked due to multiple failed attempts. Try again later."));

            if (!result.Succeeded)
                return BadRequest(new ApiResponse(400, "Email or password is wrong. Try again!"));

            var response = await CreateUserResponseAsync(user);
            return Ok(response);
        }

        [HttpPost("register")]
       
        public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
        {
            if (await CheckEmailExistsAsync(dto.Email) == true)
                return BadRequest(new ApiResponse(400, "Email already in use"));

            if (!Enum.TryParse(dto.RoleName, true, out Role parsedRole))
                return BadRequest(new ApiResponse(400, "Invalid role specified."));

            var roleAuthResult = ValidateRoleAuthorization(parsedRole);
            if (roleAuthResult != null)
                return roleAuthResult;

            var user = _mapper.Map<ApplicationUser>(dto);

            var createResult = await _userManager.CreateAsync(user, dto.Password);
            if (!createResult.Succeeded)
                return BadRequest(new ApiResponse(400,
                    BuildErrors(createResult.Errors)));

            var roleResult = await _userManager.AddToRoleAsync(user, parsedRole.ToString());
            if (!roleResult.Succeeded)
                return BadRequest(new ApiResponse(400,
                    BuildErrors(roleResult.Errors)));

            var response = await CreateUserResponseAsync(user);
            return Ok(response);
        }

        [HttpGet("refresh-token")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            var token = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new ApiResponse(401, "Refresh token missing"));

            var user = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.RefreshTokens!.Any(t => t.Token == token));

            if (user == null)
                return Unauthorized(new ApiResponse(401, "Invalid refresh token"));

            var storedToken = user.RefreshTokens!.Single(t => t.Token == token);

            if (!storedToken.IsActive)
                return Unauthorized(new ApiResponse(401, "Refresh token expired"));

            // Rotate refresh token
            storedToken.RevokedOn = DateTime.UtcNow;

            var newRefreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshTokens!.Add(newRefreshToken);

            await _userManager.UpdateAsync(user);

            _tokenService.SetRefreshTokenInCookie(
                newRefreshToken.Token,
                newRefreshToken.ExpiresOn);

            var response = _mapper.Map<UserDto>(user);
            response.Token = await _tokenService.CreateToken(user);
            response.RefreshTokenExpiration = newRefreshToken.ExpiresOn;

            return Ok(response);
        }

   
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return NoContent();

            var user = await _userManager.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u =>
                    u.RefreshTokens!.Any(t => t.Token == refreshToken));

            if (user == null)
                return NoContent();

            var token = user.RefreshTokens!.Single(t => t.Token == refreshToken);
            token.RevokedOn = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            Response.Cookies.Delete("refreshToken");
            return NoContent();
        }
        
        [HttpGet("emailexists/{email}")]
       
        public async Task<bool> CheckEmailExistsAsync(string email)
            => await _userManager.FindByEmailAsync(email) is not null;

        [HttpGet("usernameexists/{username}")]
       
        public async Task<bool> CheckUsernameExistsAsync(string username)
            => await _userManager.FindByNameAsync(username) is not null;

        [HttpPost("forgetpassword")]
      
        public async Task<ActionResult<UserDto>> ForgetPassword(ForgetPasswordDto dto)
        {
            var (response, error) = await GenerateAndSendResetPasswordEmailAsync(dto.Email);
            if (error != null)
                return BadRequest(new ApiResponse(400, error));

            return Ok(response);
        }

        [HttpPost("resend-resetpassword")]
       
        public async Task<ActionResult> ResendResetPassword([FromForm] string email)
        {
            var (response, error) = await GenerateAndSendResetPasswordEmailAsync(email);

            if (error != null)
                return StatusCode(500, new ApiResponse(500, error));

            return Ok(response);
        }

        [HttpPost("resetpassword")]
      
        public async Task<ActionResult<string>> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user is null)
                return BadRequest(new ApiResponse(400,
                    "No user with this email exists"));

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

            if (!result.Succeeded)
                return BadRequest(new ApiResponse(400,
                    BuildErrors(result.Errors)));

            return Ok("Reset password done successfully!");
        }

        // HELPERS
        private string? GetLockMessage(IdentityUser user, int defaultLockMinutes = 5)
        {
            if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow)
            {
                var remainingMinutes = (user.LockoutEnd.Value - DateTimeOffset.UtcNow).TotalMinutes;

                if (remainingMinutes <= defaultLockMinutes)
                    return $"Your account is locked due to multiple failed attempts. Try again after {Math.Ceiling(remainingMinutes)} minutes.";

                return "Your account has been locked by an admin. Please contact support.";
            }

            return null; 
        }

        private async Task<(UserDto? User, string? ErrorMessage)> GenerateAndSendResetPasswordEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null)
                return (null, "No user with this email exists");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            if (string.IsNullOrEmpty(token))
                return (null, "Failed to generate password reset token");

            var resetLink = $"{_config["UiUrl"]}/resetpassword?email={user.Email}&token={WebUtility.UrlEncode(token)}";

            var emailSent = await _emailService.SendResetPasswordEmailAsync(email, resetLink);
            if (!emailSent)
                return (null, "Failed to send reset password email");

            var response = _mapper.Map<UserDto>(user);
            response.Token = token;

            return (response, null);
        }

        private async Task<UserDto> CreateUserResponseAsync(ApplicationUser user)
        {
            var response = _mapper.Map<UserDto>(user);
            response.Roles = await _userManager.GetRolesAsync(user);
            response.Token = await _tokenService.CreateToken(user);

            user.RefreshTokens ??= new List<RefreshToken>();

            // Remove inactive tokens
            var inactiveTokens = user.RefreshTokens
                .Where(t => !t.IsActive)
                .ToList();

            foreach (var token in inactiveTokens)
                user.RefreshTokens.Remove(token);

            // Create new refresh token
            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshTokens.Add(refreshToken);

            await _userManager.UpdateAsync(user);

            _tokenService.SetRefreshTokenInCookie(
                refreshToken.Token,
                refreshToken.ExpiresOn);

            // NEVER expose refresh token
            response.RefreshTokenExpiration = refreshToken.ExpiresOn;

            return response;
        }

        private static string BuildErrors(IEnumerable<IdentityError> errors)
            => string.Join(", ", errors.Select(e => e.Description));

        private ActionResult<UserDto>? ValidateRoleAuthorization(Role role)
        {
            if (role == Role.Customer)
                return null;

            if (!User.Identity?.IsAuthenticated ?? true)
                return new UnauthorizedObjectResult(
                    new ApiResponse(StatusCodes.Status401Unauthorized,
                        "You must be logged in as SuperAdmin to assign Admin or SuperAdmin roles."));

            if (!User.IsInRole(Role.SuperAdmin.ToString()))
                return new ForbidResult();

            return null;
        }
    }
}
