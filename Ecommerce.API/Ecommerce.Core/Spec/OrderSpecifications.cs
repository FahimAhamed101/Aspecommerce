using Ecommerce.Core.Entities.orderAggregate;
using Ecommerce.Core.Params;

namespace Ecommerce.Core.Spec
{
    public static class OrderSpecifications
    {
        public static ISpecification<Order> BuildListingSpec(OrdersSpecParams specParams)
            => new OrderWithItemsSpecification(specParams, forCount: false);

        public static ISpecification<Order> BuildListingCountSpec(OrdersSpecParams specParams)
            => new OrderWithItemsSpecification(specParams, forCount: true);

        public static ISpecification<Order> BuildDetailsSpec(int id)
            => new OrderWithItemsSpecification(id);

        public static ISpecification<Order> BuildOrderWithItemsSpec(int id)
            => new OrderWithItemsSpecification(id);

        private class OrderWithItemsSpecification : BaseSpecification<Order>
        {
            public OrderWithItemsSpecification(OrdersSpecParams specParams, bool forCount)
                : base(BuildCriteria(specParams))
            {
                if (forCount)
                    return;

                AddInclude(o => o.OrderItems);
                AddInclude(o => o.DeliveryMethod);

                ApplyPaging((specParams.PageIndex - 1) * specParams.PageSize, specParams.PageSize);

                switch (specParams.Sort?.ToLowerInvariant())
                {
                    case "dateasc":
                        AddOrderBy(o => o.OrderDate);
                        break;
                    case "datedesc":
                    default:
                        AddOrderByDescending(o => o.OrderDate);
                        break;
                }
            }

            public OrderWithItemsSpecification(int id)
                : base(o => o.Id == id)
            {
                AddInclude(o => o.OrderItems);
                AddInclude(o => o.DeliveryMethod);
            }

            private static System.Linq.Expressions.Expression<Func<Order, bool>> BuildCriteria(OrdersSpecParams specParams)
            {
                var search = specParams.Search?.ToLowerInvariant();

                OrderStatus? status = null;
                if (!string.IsNullOrWhiteSpace(specParams.Status) &&
                    Enum.TryParse(specParams.Status, true, out OrderStatus parsed))
                {
                    status = parsed;
                }

                var buyerEmail = specParams.BuyerEmail;

                return o =>
                    (string.IsNullOrWhiteSpace(search) || o.BuyerEmail.ToLower().Contains(search)) &&
                    (string.IsNullOrWhiteSpace(buyerEmail) || o.BuyerEmail == buyerEmail) &&
                    (!status.HasValue || o.Status == status.Value);
            }
        }
    }
}
