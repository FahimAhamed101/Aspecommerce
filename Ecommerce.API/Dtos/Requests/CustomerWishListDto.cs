namespace Ecommerce.API.Dtos.Requests
{
    public class CustomerWishListDto
    {
        public string Id { get; set; } = string.Empty;

        public ICollection<WishListItemDto> Items { get; set; } = new List<WishListItemDto>();
    }
}
