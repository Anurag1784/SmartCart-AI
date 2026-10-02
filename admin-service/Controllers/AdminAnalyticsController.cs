using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/analytics")]
    [Authorize(Roles = "ADMIN")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly OrderClient _orderClient;
        private readonly PaymentClient _paymentClient;
        private readonly ProductClient _productClient;
        private readonly InventoryClient _inventoryClient;

        public AdminAnalyticsController(
            OrderClient orderClient,
            PaymentClient paymentClient,
            ProductClient productClient,
            InventoryClient inventoryClient)
        {
            _orderClient = orderClient;
            _paymentClient = paymentClient;
            _productClient = productClient;
            _inventoryClient = inventoryClient;
        }

        [HttpGet]
        public async Task<IActionResult> GetAnalytics()
        {
            // Get the ADMIN JWT from the incoming request.
            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // Fetch data from the existing microservices.
            var orders = await _orderClient.GetAllOrdersAsync(jwtToken);
            var payments = await _paymentClient.GetAllPaymentsAsync(jwtToken);
            var products = await _productClient.GetAllProductsAsync();
            var inventory = await _inventoryClient.GetAllInventoryAsync(jwtToken);

            // -----------------------------------------
            // ORDER STATUS DISTRIBUTION
            // -----------------------------------------

            var orderStatusDistribution =
                orders
                    .GroupBy(order => order.OrderStatus)
                    .Select(group => new
                    {
                        status = group.Key,
                        count = group.Count()
                    })
                    .OrderByDescending(item => item.count)
                    .ToList();

            // -----------------------------------------
            // PAYMENT STATUS DISTRIBUTION
            // -----------------------------------------

            var paymentStatusDistribution =
                payments
                    .GroupBy(payment => payment.PaymentStatus)
                    .Select(group => new
                    {
                        status = group.Key,
                        count = group.Count()
                    })
                    .OrderByDescending(item => item.count)
                    .ToList();

            // -----------------------------------------
            // PAYMENT METHOD DISTRIBUTION
            // -----------------------------------------

            var paymentMethodDistribution =
                payments
                    .GroupBy(payment => payment.PaymentMethod)
                    .Select(group => new
                    {
                        method = group.Key,
                        count = group.Count(),
                        totalAmount = group.Sum(payment => payment.Amount)
                    })
                    .OrderByDescending(item => item.count)
                    .ToList();

            // -----------------------------------------
            // SUCCESSFUL PAYMENTS
            // -----------------------------------------

            var successfulPayments =
                payments
                    .Where(payment =>
                        string.Equals(
                            payment.PaymentStatus,
                            "SUCCESS",
                            StringComparison.OrdinalIgnoreCase
                        ))
                    .ToList();

            var totalSuccessfulRevenue =
                successfulPayments.Sum(payment => payment.Amount);

            var averageSuccessfulPayment =
                successfulPayments.Count > 0
                    ? totalSuccessfulRevenue / successfulPayments.Count
                    : 0;

            // -----------------------------------------
            // PRODUCT CATEGORY DISTRIBUTION
            // -----------------------------------------

            var categoryDistribution =
                products
                    .Where(product => product.Category != null)
                    .GroupBy(product => product.Category!.CategoryName)
                    .Select(group => new
                    {
                        category = group.Key,
                        productCount = group.Count()
                    })
                    .OrderByDescending(item => item.productCount)
                    .ToList();

            // -----------------------------------------
            // LOW STOCK INVENTORY
            // -----------------------------------------

            var lowStockInventory =
                inventory
                    .Where(item =>
                        item.AvailableQuantity <= item.ReorderLevel)
                    .ToList();

            // -----------------------------------------
            // INVENTORY TOTALS
            // -----------------------------------------

            var totalAvailableQuantity =
                inventory.Sum(item => item.AvailableQuantity);

            var totalReservedQuantity =
                inventory.Sum(item => item.ReservedQuantity);

            // -----------------------------------------
            // FINAL ANALYTICS RESPONSE
            // -----------------------------------------

            return Ok(new
            {
                overview = new
                {
                    totalOrders = orders.Count,
                    totalPayments = payments.Count,
                    successfulPayments = successfulPayments.Count,
                    totalRevenue = totalSuccessfulRevenue,
                    averagePaymentAmount = averageSuccessfulPayment,
                    totalProducts = products.Count,
                    totalInventory = inventory.Count,
                    lowStockCount = lowStockInventory.Count,
                    totalAvailableQuantity,
                    totalReservedQuantity
                },

                orderStatusDistribution,

                paymentStatusDistribution,

                paymentMethodDistribution,

                categoryDistribution,

                lowStockInventory
            });
        }
    }
}