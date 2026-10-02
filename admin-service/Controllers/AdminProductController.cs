using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/products")]
    [Authorize(Roles = "ADMIN")]
    public class AdminProductController : ControllerBase
    {
        private readonly ProductClient _productClient;

        public AdminProductController(ProductClient productClient)
        {
            _productClient = productClient;
        }

        // =========================================================
        // GET ALL PRODUCTS
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            // Call Product Service through ProductClient.
            var products = await _productClient.GetAllProductsAsync();

            // Return all products to the ADMIN.
            return Ok(products);
        }
    }
}