using admin_service.Clients;
using admin_service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/categories")]
    [Authorize(Roles = "ADMIN")]
    public class AdminCategoryController : ControllerBase
    {
        private readonly ProductClient _productClient;
        private readonly AuditService _auditService;

        public AdminCategoryController(
            ProductClient productClient,
            AuditService auditService)
        {
            _productClient = productClient;
            _auditService = auditService;
        }

        // =========================================================
        // GET ALL CATEGORIES
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            // Ask Product Service for all categories.
            var categories = await _productClient.GetCategoriesAsync();

            // Return the categories to the Admin frontend/client.
            return Ok(categories);
        }


        // =========================================================
        // CREATE CATEGORY
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> CreateCategory(
            [FromBody] CreateCategoryRequest request)
        {
            // ---------------------------------------------------------
            // Get the JWT used to authenticate this Admin request.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Forward the ADMIN JWT to Product Service.
            // ---------------------------------------------------------

            var category =
                await _productClient.CreateCategoryAsync(
                    request,
                    jwtToken
                );

            // ---------------------------------------------------------
            // Record successful Admin action.
            // ---------------------------------------------------------

            var adminEmail =
                User.FindFirst("sub")?.Value ?? "UNKNOWN_ADMIN";

            await _auditService.LogAsync(
                adminEmail,
                "CREATE_CATEGORY",
                "CATEGORY",
                category.CategoryId,
                "SUCCESS"
            );

            // ---------------------------------------------------------
            // Return the newly created category.
            // ---------------------------------------------------------

            return StatusCode(
                StatusCodes.Status201Created,
                category
            );
        }


        // =========================================================
        // UPDATE CATEGORY
        // =========================================================

        [HttpPut("{categoryId}")]
        public async Task<IActionResult> UpdateCategory(
            long categoryId,
            [FromBody] CreateCategoryRequest request)
        {
            // ---------------------------------------------------------
            // Get the ADMIN JWT from the current request.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Forward the category update and ADMIN JWT
            // to Product Service.
            // ---------------------------------------------------------

            var category =
                await _productClient.UpdateCategoryAsync(
                    categoryId,
                    request,
                    jwtToken
                );

            // ---------------------------------------------------------
            // Record successful Admin action.
            // ---------------------------------------------------------

            var adminEmail =
                User.FindFirst("sub")?.Value ?? "UNKNOWN_ADMIN";

            await _auditService.LogAsync(
                adminEmail,
                "UPDATE_CATEGORY",
                "CATEGORY",
                categoryId,
                "SUCCESS"
            );

            // ---------------------------------------------------------
            // Return the updated category.
            // ---------------------------------------------------------

            return Ok(category);
        }


        // =========================================================
        // DELETE CATEGORY
        // =========================================================

        [HttpDelete("{categoryId}")]
        public async Task<IActionResult> DeleteCategory(
            long categoryId)
        {
            // ---------------------------------------------------------
            // Get the ADMIN JWT from the current request.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Forward the category ID and ADMIN JWT
            // to Product Service.
            // ---------------------------------------------------------

            await _productClient.DeleteCategoryAsync(
                categoryId,
                jwtToken
            );

            // ---------------------------------------------------------
            // Product Service successfully deleted the category.
            // Now record the successful Admin action.
            // ---------------------------------------------------------

            var adminEmail =
                User.FindFirst("sub")?.Value ?? "UNKNOWN_ADMIN";

            await _auditService.LogAsync(
                adminEmail,
                "DELETE_CATEGORY",
                "CATEGORY",
                categoryId,
                "SUCCESS"
            );

            // ---------------------------------------------------------
            // Return successful deletion.
            // ---------------------------------------------------------

            return NoContent();
        }
    }
}