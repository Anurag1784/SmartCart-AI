using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "ADMIN")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly ProductClient _productClient;
        private readonly AuthClient _authClient;
        private readonly OrderClient _orderClient;
        private readonly PaymentClient _paymentClient;
        private readonly InventoryClient _inventoryClient;

        public AdminDashboardController(
     ProductClient productClient,
     AuthClient authClient,
     OrderClient orderClient,
     PaymentClient paymentClient,
     InventoryClient inventoryClient)
        {
            _productClient = productClient;
            _authClient = authClient;
            _orderClient = orderClient;
            _paymentClient = paymentClient;
            _inventoryClient = inventoryClient;
        }
        // =========================================================
        // GET TOTAL PRODUCT COUNT
        // =========================================================

        [HttpGet("product-count")]
        public async Task<IActionResult> GetProductCount()
        {
            // Ask Product Service for the total product count.
            var count = await _productClient.GetProductCountAsync();

            // Return the count to the Admin Dashboard.
            return Ok(new
            {
                totalProducts = count
            });
        }
        // =========================================================
        // GET ADMIN DASHBOARD STATISTICS
        // =========================================================

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // ---------------------------------------------------------
            // Get the JWT of the currently authenticated Admin.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Get total customers from Auth Service.
            // ---------------------------------------------------------

            var totalCustomers =
                await _authClient.GetUserCountAsync(
                    "CUSTOMER",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Get total sellers from Auth Service.
            // ---------------------------------------------------------

            var totalSellers =
                await _authClient.GetUserCountAsync(
                    "SELLER",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Get total admins from Auth Service.
            // ---------------------------------------------------------

            var totalAdmins =
                await _authClient.GetUserCountAsync(
                    "ADMIN",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Get total products from Product Service.
            // ---------------------------------------------------------

            var totalProducts =
                await _productClient.GetProductCountAsync();

            // ---------------------------------------------------------
            // Get total orders from Order Service.
            // ---------------------------------------------------------

            var totalOrders =
                await _orderClient.GetOrderCountAsync(
                    jwtToken
                );

            // ---------------------------------------------------------
            // Get payment statistics from Payment Service.
            // ---------------------------------------------------------
            var totalPayments =
                await _paymentClient.GetPaymentCountAsync(
                    jwtToken
                );

            var totalRevenue =
                await _paymentClient.GetTotalRevenueAsync(
                    jwtToken
                );

            // ---------------------------------------------------------
            // Get low-stock inventory from Inventory Service.
            // ---------------------------------------------------------
            var lowStockInventory =
                await _inventoryClient.GetLowStockInventoryAsync(
                    jwtToken
                );

            // ---------------------------------------------------------
            // Calculate derived analytics.
            // ---------------------------------------------------------

            var averagePaymentAmount =
                totalPayments > 0
                    ? totalRevenue / totalPayments
                    : 0;

            var lowStockInventoryCount =
                lowStockInventory.Count;

            // ---------------------------------------------------------
            // Return all dashboard statistics together.
            // ---------------------------------------------------------
            return Ok(new
            {
                totalCustomers,
                totalSellers,
                totalAdmins,
                totalProducts,
                totalOrders,
                totalPayments,
                totalRevenue,
                averagePaymentAmount,
                lowStockInventoryCount,
                lowStockInventory
            });
        }
    }
}