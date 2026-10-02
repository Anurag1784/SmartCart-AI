using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/inventory")]
    [Authorize(Roles = "ADMIN")]
    public class AdminInventoryController : ControllerBase
    {
        private readonly InventoryClient _inventoryClient;

        public AdminInventoryController(
            InventoryClient inventoryClient)
        {
            _inventoryClient = inventoryClient;
        }


        // =========================================================
        // GET ALL INVENTORY
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAllInventory()
        {
            var jwtToken = GetJwtToken();

            var inventory =
                await _inventoryClient.GetAllInventoryAsync(jwtToken);

            return Ok(inventory);
        }


        // =========================================================
        // GET LOW-STOCK INVENTORY
        // =========================================================

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockInventory()
        {
            var jwtToken = GetJwtToken();

            var inventory =
                await _inventoryClient.GetLowStockInventoryAsync(jwtToken);

            return Ok(inventory);
        }


        // =========================================================
        // GET JWT TOKEN
        // =========================================================

        private string GetJwtToken()
        {
            return Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");
        }
    }
}