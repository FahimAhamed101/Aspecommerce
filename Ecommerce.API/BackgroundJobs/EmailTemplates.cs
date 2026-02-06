using Ecommerce.Core.Entities.orderAggregate;
using System.Text;

namespace Ecommerce.API.BackgroundJobs
{
    public static class EmailTemplates
    {
        public static string OrderConfirmation(Order order)
        {
            var sb = new StringBuilder();
            sb.Append("<h2>Order Confirmation</h2>");
            sb.Append($"<p>Thank you for your order #{order.Id}.</p>");
            sb.Append($"<p>Order Date: {order.OrderDate:yyyy-MM-dd}</p>");
            sb.Append("<ul>");

            foreach (var item in order.OrderItems)
            {
                sb.Append("<li>");
                sb.Append($"{item.ProductItemOrdered.ProductName} x {item.Quantity} - {item.Price:C}");
                sb.Append("</li>");
            }

            sb.Append("</ul>");
            sb.Append($"<p>Subtotal: {order.SubTotal:C}</p>");
            sb.Append($"<p>Shipping: {order.DeliveryMethod.Price:C}</p>");
            sb.Append($"<p><strong>Total: {order.GetTotal():C}</strong></p>");

            return sb.ToString();
        }
    }
}
