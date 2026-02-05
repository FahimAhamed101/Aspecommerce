namespace Ecommerce.Core.Entities
{
    public class CustomerWishList
    {
        public CustomerWishList()
        {
            Id = string.Empty;
        }

        public CustomerWishList(string id)
        {
            Id = id;
        }

        public string Id { get; set; }
        public ICollection<WishListItem> Items { get; set; } = [];
    }
}
