using AutoMapper;
using Ecommerce.API.Dtos.Requests;
using Ecommerce.Core.Entities;
using Ecommerce.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Ecommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("customer-cart")]
    public class BasketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public BasketsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerBasketDto>> GetById(string id)
        {
            var basket = await _context.CustomerBaskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id); // Adjust based on your ID type

            if (basket == null)
            {
                return NotFound($"Basket with ID '{id}' not found.");
            }

            return Ok(_mapper.Map<CustomerBasketDto>(basket));
        }

        [HttpPost]
        public async Task<ActionResult<CustomerBasketDto>> UpdateOrCreate([FromBody] CustomerBasketDto dto)
        {
            CustomerBasket basket;

            // Check if basket exists
            if (!string.IsNullOrEmpty(dto.Id))
            {
                basket = await _context.CustomerBaskets
                    .FirstOrDefaultAsync(b => b.Id == dto.Id);

                if (basket != null)
                {
                    // Update existing basket
                    _mapper.Map(dto, basket);
                    _context.CustomerBaskets.Update(basket);
                }
                else
                {
                    // Create new basket
                    basket = _mapper.Map<CustomerBasket>(dto);
                    await _context.CustomerBaskets.AddAsync(basket);
                }
            }
            else
            {
                // Create new basket
                basket = _mapper.Map<CustomerBasket>(dto);
                await _context.CustomerBaskets.AddAsync(basket);
            }

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerBasketDto>(basket));
        }

        [HttpPost("{id}/items")]
        public async Task<ActionResult<CustomerBasketDto>> AddItem(
            [FromRoute] string id,
            [FromBody] BasketItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest("Basket ID is required.");
            }

            var basket = await _context.CustomerBaskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (basket == null)
            {
                basket = new CustomerBasket(id);
                await _context.CustomerBaskets.AddAsync(basket);
            }

            var quantityToAdd = dto.Quantity <= 0 ? 1 : dto.Quantity;
            var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == dto.Id);

            if (existingItem != null)
            {
                existingItem.Quantity += quantityToAdd;
                existingItem.ProductName = dto.ProductName;
                existingItem.Brand = dto.Brand;
                existingItem.Type = dto.Type;
                existingItem.PictureUrl = dto.PictureUrl;
                existingItem.Price = dto.Price;
            }
            else
            {
                var newItem = _mapper.Map<BasketItem>(dto);
                newItem.ProductId = dto.Id;
                newItem.Quantity = quantityToAdd;
                basket.Items.Add(newItem);
            }

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerBasketDto>(basket));
        }

        [HttpPost("{id}/items/{itemId:int}/increment")]
        public async Task<ActionResult<CustomerBasketDto>> IncrementItem(
            [FromRoute] string id,
            [FromRoute] int itemId)
        {
            var basket = await _context.CustomerBaskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (basket == null)
            {
                return NotFound($"Basket with ID '{id}' not found.");
            }

            var item = basket.Items.FirstOrDefault(i => i.ProductId == itemId);
            if (item == null)
            {
                return NotFound($"Item with ID '{itemId}' not found in basket '{id}'.");
            }

            item.Quantity += 1;
            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerBasketDto>(basket));
        }

        [HttpPost("{id}/items/{itemId:int}/decrement")]
        public async Task<ActionResult<CustomerBasketDto>> DecrementItem(
            [FromRoute] string id,
            [FromRoute] int itemId)
        {
            var basket = await _context.CustomerBaskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (basket == null)
            {
                return NotFound($"Basket with ID '{id}' not found.");
            }

            var item = basket.Items.FirstOrDefault(i => i.ProductId == itemId);
            if (item == null)
            {
                return NotFound($"Item with ID '{itemId}' not found in basket '{id}'.");
            }

            item.Quantity -= 1;

            if (item.Quantity <= 0)
            {
                basket.Items.Remove(item);
                _context.Remove(item);
            }

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerBasketDto>(basket));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var basket = await _context.CustomerBaskets
                .FirstOrDefaultAsync(b => b.Id == id);

            if (basket == null)
            {
                return NotFound($"Basket with ID '{id}' not found.");
            }

            _context.CustomerBaskets.Remove(basket);
            await _context.SaveChangesAsync();
            
            return Ok($"Basket with ID '{id}' deleted successfully.");
        }
    }
}
