using System.Net;
using AutoMapper;
using Ecommerce.API.Dtos.Requests;
using Ecommerce.API.Dtos.Responses;
using Ecommerce.API.Errors;
using Ecommerce.API.Helpers;
using Ecommerce.Core.Entities;
using Ecommerce.Core.Interfaces;
using Ecommerce.Infrastructure.Constants;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    public class ProductBrandsController : BaseApiController
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProductBrandsController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ProductBrandAndTypeResponseDto>>> GetAll()
        {
            var brands = await _unitOfWork.Repository<ProductBrand>().GetAllAsync();
            return Ok(_mapper.Map<IReadOnlyList<ProductBrandAndTypeResponseDto>>(brands));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductBrandAndTypeResponseDto>> GetById(int id)
        {
            var brand = await _unitOfWork.Repository<ProductBrand>().GetByIdAsync(id);
            if (brand is null)
                return NotFound(new ApiResponse((int)HttpStatusCode.NotFound));

            return Ok(_mapper.Map<ProductBrandAndTypeResponseDto>(brand));
        }

        [HttpPost]
        [AuthorizePermission(Modules.Products, CRUD.Create)]
        public async Task<ActionResult<ProductBrandAndTypeResponseDto>> Create(
            ProductBrandAndTypeCreationDto creationDto)
        {
            var brand = _mapper.Map<ProductBrandAndTypeCreationDto, ProductBrand>(creationDto);
            
            // FIX 1: Repository.Create() is void, so don't use 'await' or 'var'
            _unitOfWork.Repository<ProductBrand>().Create(brand); // No await, no var
            
            // FIX 2: Just await Complete(), don't assign to var
            await _unitOfWork.Complete(); // Changed from: var result = await _unitOfWork.Complete();
            
            return CreatedAtAction(nameof(GetById), 
                new { id = brand.Id },
                _mapper.Map<ProductBrandAndTypeResponseDto>(brand));
        }

        [HttpDelete("{id:int}")]
        [AuthorizePermission(Modules.Products, CRUD.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var brand = await _unitOfWork.Repository<ProductBrand>().GetByIdAsync(id);
            if (brand is null)
                return NotFound(new ApiResponse((int)HttpStatusCode.NotFound));

            // Repository.Delete() is void
            _unitOfWork.Repository<ProductBrand>().Delete(brand); // No await, no var
            
            // Just await Complete()
            await _unitOfWork.Complete(); // Changed from: var result = await _unitOfWork.Complete();
            
            return NoContent();
        }
        
        // Optional: Add Update method
        [HttpPut("{id:int}")]
        [AuthorizePermission(Modules.Products, CRUD.Update)]
        public async Task<ActionResult<ProductBrandAndTypeResponseDto>> Update(
            int id, 
            ProductBrandAndTypeCreationDto updateDto)
        {
            var brand = await _unitOfWork.Repository<ProductBrand>().GetByIdAsync(id);
            if (brand is null)
                return NotFound(new ApiResponse((int)HttpStatusCode.NotFound));

            _mapper.Map(updateDto, brand);
            
            // Repository.Update() is void
            _unitOfWork.Repository<ProductBrand>().Update(brand); // No await, no var
            
            await _unitOfWork.Complete(); // No var assignment
            
            return Ok(_mapper.Map<ProductBrandAndTypeResponseDto>(brand));
        }
    }
}