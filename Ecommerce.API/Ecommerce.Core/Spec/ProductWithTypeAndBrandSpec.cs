using Ecommerce.Core.Entities;
using Ecommerce.Core.Spec;
using Ecommerce.Core.Params;

namespace Ecommerce.Core.Spec
{
    public class ProductWithTypeAndBrandSpec : BaseSpecification<Product>
    {
        public ProductWithTypeAndBrandSpec(int id) : base(p => p.Id == id)
        {
            AddInclude(p => p.ProductBrand);
            AddInclude(p => p.ProductType);
        }

        public ProductWithTypeAndBrandSpec(ProductSpecParams specParams, bool forCount = false) : base(p =>
            (string.IsNullOrEmpty(specParams.Search) || p.Name.ToLower().Contains(specParams.Search)) &&
            (!specParams.BrandId.HasValue || p.ProductBrandId == specParams.BrandId.Value) &&
            (!specParams.TypeId.HasValue || p.ProductTypeId == specParams.TypeId.Value) &&
            (!specParams.MinAverageRating.HasValue || p.ProductReviews.Any() && p.ProductReviews.Average(r => r.Rating) >= specParams.MinAverageRating.Value))
        {
            AddInclude(p => p.ProductBrand);
            AddInclude(p => p.ProductType);
            AddInclude(p => p.ProductReviews);

            if (!string.IsNullOrEmpty(specParams.Sort))
            {
                switch (specParams.Sort)
                {
                    case "priceAsc":
                        AddOrderBy(p => p.Price);
                        break;
                    case "priceDesc":
                        AddOrderByDescending(p => p.Price);
                        break;
                    case "nameAsc":
                        AddOrderBy(p => p.Name);
                        break;
                    case "nameDesc":
                        AddOrderByDescending(p => p.Name);
                        break;
                    case "ratingDesc":
                        AddOrderByDescending(p => p.ProductReviews.Any() ? p.ProductReviews.Average(r => r.Rating) : 0);
                        break;
                    default:
                        AddOrderBy(p => p.Name);
                        break;
                }
            }

            if (!forCount)
                ApplyPaging(specParams.PageSize * (specParams.PageIndex - 1), specParams.PageSize);
        }
    }
}