using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/orders")]
    [Authorize(Roles = "ADMIN")]
    public class AdminOrderController : ControllerBase
    {
        private readonly OrderClient _orderClient;

        public AdminOrderController(OrderClient orderClient)
        {
            _orderClient = orderClient;
        }


        // =========================================================
        // GET ALL ORDERS
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            // ---------------------------------------------------------
            // Get the ADMIN JWT from the incoming request.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Call Order Service through OrderClient.
            // ---------------------------------------------------------

            var orders =
                await _orderClient.GetAllOrdersAsync(jwtToken);

            // ---------------------------------------------------------
            // Return all orders to the ADMIN.
            // ---------------------------------------------------------

            return Ok(orders);
        }


        // =========================================================
        // GET TOTAL ORDER COUNT
        // =========================================================

        [HttpGet("count")]
        public async Task<IActionResult> GetOrderCount()
        {
            // ---------------------------------------------------------
            // Get the ADMIN JWT from the incoming request.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Call Order Service through OrderClient.
            // ---------------------------------------------------------

            var count =
                await _orderClient.GetOrderCountAsync(jwtToken);

            // ---------------------------------------------------------
            // Return the total number of orders.
            // ---------------------------------------------------------

            return Ok(new
            {
                totalOrders = count
            });
        }


        // =========================================================
        // GET ORDER BY ID
        // =========================================================

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(
            long orderId)
        {
            // ---------------------------------------------------------
            // Get the ADMIN JWT from the incoming request.
            // ---------------------------------------------------------

            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // ---------------------------------------------------------
            // Call Order Service through OrderClient.
            // ---------------------------------------------------------

            var order =
                await _orderClient.GetOrderByIdAsync(
                    orderId,
                    jwtToken
                );

            // ---------------------------------------------------------
            // If the order does not exist, return 404.
            // ---------------------------------------------------------

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Order not found."
                });
            }

            // ---------------------------------------------------------
            // Return the requested order.
            // ---------------------------------------------------------

            return Ok(order);
        }
    }
}