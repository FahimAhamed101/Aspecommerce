using AutoMapper;
using Ecommerce.API.Dtos.Requests;
using Ecommerce.API.Dtos.Responses;
using Ecommerce.API.Dtos;
using Ecommerce.Core.Entities;
using Ecommerce.Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.API.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // RegisterDto to ApplicationUser mapping
            CreateMap<RegisterDto, ApplicationUser>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender));

            // ApplicationUser to UserDto mapping
            CreateMap<ApplicationUser, UserDto>();

            // ApplicationUser to UserCommonDto mapping
            CreateMap<ApplicationUser, UserCommonDto>();

            // Profile mappings
            CreateMap<ApplicationUser, ProfileResponseDto>();
            CreateMap<ProfileUpdateDto, ApplicationUser>();

            // Address mappings
            CreateMap<Address, AddressDto>().ReverseMap();

            // Roles and permissions mappings
            CreateMap<IdentityRole, RoleDto>();
            CreateMap<RoleToCreateDto, IdentityRole>();
            CreateMap<ApplicationUser, UserRolesDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));
            CreateMap<IdentityRole, CheckBoxRoleManageDto>()
                .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Name));
            CreateMap<IdentityRole, RolePermissionsDto>()
                .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Name));

            // Product mappings
            CreateMap<ProductCreationDto, Product>()
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.StockQuantity));

            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.ProductBrandName, opt => opt.MapFrom(src => src.ProductBrand.Name))
                .ForMember(dest => dest.ProductTypeName, opt => opt.MapFrom(src => src.ProductType.Name));

            CreateMap<ProductUpdateDto, Product>()
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.StockQuantity));

            // Basket mappings
            CreateMap<BasketItemDto, BasketItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.Id));
            CreateMap<BasketItem, BasketItemDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ProductId));
            CreateMap<CustomerBasketDto, CustomerBasket>().ReverseMap();

            // Wishlist mappings
            CreateMap<WishListItemDto, WishListItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.Id));
            CreateMap<WishListItem, WishListItemDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ProductId));
            CreateMap<CustomerWishListDto, CustomerWishList>().ReverseMap();
        }
    }
}
