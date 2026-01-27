using Microsoft.AspNetCore.Mvc.Filters;

namespace Ecommerce.API.Helpers
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = false)]
    public class DisableRateLimitingAttribute : Attribute, IFilterMetadata
    {
        // This attribute disables rate limiting for the decorated action/method
    }
}