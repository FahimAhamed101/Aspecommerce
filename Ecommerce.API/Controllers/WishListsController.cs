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
    [EnableRateLimiting("customer-wishlist")]
    public class WishListsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public WishListsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerWishListDto>> GetById(string id)
        {
            var wishlist = await _context.CustomerWishLists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (wishlist == null)
            {
                return NotFound($"Wishlist with ID '{id}' not found.");
            }

            return Ok(_mapper.Map<CustomerWishListDto>(wishlist));
        }

        [HttpPost]
        public async Task<ActionResult<CustomerWishListDto>> UpdateOrCreate([FromBody] CustomerWishListDto dto)
        {
            CustomerWishList wishlist;

            if (!string.IsNullOrEmpty(dto.Id))
            {
                wishlist = await _context.CustomerWishLists
                    .FirstOrDefaultAsync(w => w.Id == dto.Id);

                if (wishlist != null)
                {
                    _mapper.Map(dto, wishlist);
                    _context.CustomerWishLists.Update(wishlist);
                }
                else
                {
                    wishlist = _mapper.Map<CustomerWishList>(dto);
                    await _context.CustomerWishLists.AddAsync(wishlist);
                }
            }
            else
            {
                wishlist = _mapper.Map<CustomerWishList>(dto);
                await _context.CustomerWishLists.AddAsync(wishlist);
            }

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerWishListDto>(wishlist));
        }

        [HttpPost("{id}/items")]
        public async Task<ActionResult<CustomerWishListDto>> AddItem(
            [FromRoute] string id,
            [FromBody] WishListItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest("Wishlist ID is required.");
            }

            var wishlist = await _context.CustomerWishLists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (wishlist == null)
            {
                wishlist = new CustomerWishList(id);
                await _context.CustomerWishLists.AddAsync(wishlist);
            }

            var quantityToAdd = dto.Quantity <= 0 ? 1 : dto.Quantity;
            var existingItem = wishlist.Items.FirstOrDefault(i => i.ProductId == dto.Id);

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
                var newItem = _mapper.Map<WishListItem>(dto);
                newItem.ProductId = dto.Id;
                newItem.Quantity = quantityToAdd;
                wishlist.Items.Add(newItem);
            }

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerWishListDto>(wishlist));
        }

        [HttpPost("{id}/items/{itemId:int}/increment")]
        public async Task<ActionResult<CustomerWishListDto>> IncrementItem(
            [FromRoute] string id,
            [FromRoute] int itemId)
        {
            var wishlist = await _context.CustomerWishLists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (wishlist == null)
            {
                return NotFound($"Wishlist with ID '{id}' not found.");
            }

            var item = wishlist.Items.FirstOrDefault(i => i.ProductId == itemId);
            if (item == null)
            {
                return NotFound($"Item with ID '{itemId}' not found in wishlist '{id}'.");
            }

            item.Quantity += 1;
            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerWishListDto>(wishlist));
        }

        [HttpPost("{id}/items/{itemId:int}/decrement")]
        public async Task<ActionResult<CustomerWishListDto>> DecrementItem(
            [FromRoute] string id,
            [FromRoute] int itemId)
        {
            var wishlist = await _context.CustomerWishLists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (wishlist == null)
            {
                return NotFound($"Wishlist with ID '{id}' not found.");
            }

            var item = wishlist.Items.FirstOrDefault(i => i.ProductId == itemId);
            if (item == null)
            {
                return NotFound($"Item with ID '{itemId}' not found in wishlist '{id}'.");
            }

            item.Quantity -= 1;

            if (item.Quantity <= 0)
            {
                wishlist.Items.Remove(item);
                _context.Remove(item);
            }

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<CustomerWishListDto>(wishlist));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var wishlist = await _context.CustomerWishLists
                .FirstOrDefaultAsync(w => w.Id == id);

            if (wishlist == null)
            {
                return NotFound($"Wishlist with ID '{id}' not found.");
            }

            _context.CustomerWishLists.Remove(wishlist);
            await _context.SaveChangesAsync();

            return Ok($"Wishlist with ID '{id}' deleted successfully.");
        }
    }
}
