using Ecommerce.Core.Entities;
using Ecommerce.Core.Entities.orderAggregate;
using Ecommerce.Core.Interfaces;
using Ecommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order?> CreateOrderAsync(
            string buyerEmail,
            string userId,
            int deliverMethodId,
            string basketId,
            OrderAddress shippingAddress)
        {
            var basket = await _context.CustomerBaskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == basketId);

            if (basket == null || basket.Items.Count == 0)
                return null;

            var orderItems = basket.Items
                .Select(item => new OrderItem(
                    item.Price,
                    item.Quantity,
                    new ProductItemOrdered(item.ProductId, item.ProductName, item.PictureUrl)))
                .ToList();

            var subTotal = orderItems.Sum(i => i.Price * i.Quantity);

            var deliveryMethod = await _context.DeliveryMethods
                .FirstOrDefaultAsync(d => d.Id == deliverMethodId);

            if (deliveryMethod == null)
            {
                deliveryMethod = new DeliveryMethod
                {
                    ShortName = "Standard",
                    Description = "Standard delivery",
                    DeliveryTime = "3-5 days",
                    Price = 0m
                };
            }

            var order = new Order(orderItems, buyerEmail, subTotal, shippingAddress, deliveryMethod)
            {
                ApplicationUserId = userId,
                PaymentIntenId = basket.PaymentIntentId ?? string.Empty
            };

            _context.Set<Order>().Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail)
        {
            return await _context.Set<Order>()
                .Include(o => o.OrderItems)
                .Include(o => o.DeliveryMethod)
                .Where(o => o.BuyerEmail == buyerEmail)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int id, string buyerEmail)
        {
            return await _context.Set<Order>()
                .Include(o => o.OrderItems)
                .Include(o => o.DeliveryMethod)
                .FirstOrDefaultAsync(o => o.Id == id && o.BuyerEmail == buyerEmail);
        }

        public async Task CancelOrder(Order order)
        {
            order.Status = OrderStatus.Cancel;
            _context.Set<Order>().Update(order);
            await _context.SaveChangesAsync();
        }
    }
}
