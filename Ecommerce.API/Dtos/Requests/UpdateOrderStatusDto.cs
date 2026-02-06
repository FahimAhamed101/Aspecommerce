using System.ComponentModel.DataAnnotations;
using Ecommerce.Core.Entities.orderAggregate;

namespace Ecommerce.API.Dtos.Requests
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}
