using AutoMapper;
using Ecommerce.API.Dtos.Requests;
using Ecommerce.API.Dtos.Responses;
using Ecommerce.Core.Entities.Identity;

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
        }
    }
}
