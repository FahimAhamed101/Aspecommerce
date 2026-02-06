using AutoMapper;
using Ecommerce.API.Errors;
using Ecommerce.API.Helpers;
using Ecommerce.Core.Entities;
using Ecommerce.Core.Interfaces;
using Ecommerce.Core.Spec;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Extensions
{
    public static class ControllerExtensions
    {
        public static async Task<ActionResult<Pagination<TDest>>> ToPagedResultAsync<TEntity, TDest>(
            this ControllerBase controller,
            IUnitOfWork unitOfWork,
            ISpecification<TEntity> dataSpec,
            ISpecification<TEntity> countSpec,
            int pageIndex,
            int pageSize,
            IMapper mapper) where TEntity : BaseEntity
        {
            var count = await unitOfWork.Repository<TEntity>().CountAsync(countSpec);
            var data = await unitOfWork.Repository<TEntity>().ListAsync(dataSpec);
            var mapped = mapper.Map<IReadOnlyList<TEntity>, IReadOnlyList<TDest>>(data);

            return controller.Ok(new Pagination<TDest>(pageIndex, pageSize, count, mapped));
        }

        public static ActionResult NotFoundResponse(this ControllerBase controller)
        {
            return controller.NotFound(new ApiResponse(404));
        }
    }
}
