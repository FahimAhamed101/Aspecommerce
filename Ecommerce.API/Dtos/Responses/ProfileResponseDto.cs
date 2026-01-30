namespace Ecommerce.API.Dtos.Responses
{
    public class ProfileResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
    }
}
