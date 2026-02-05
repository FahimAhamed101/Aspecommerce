using Ecommerce.Core.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace Ecommerce.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity;
        Task<int> CompleteAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task Complete();
    }
}