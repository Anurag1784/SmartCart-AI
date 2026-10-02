using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/payments")]
    [Authorize(Roles = "ADMIN")]
    public class AdminPaymentController : ControllerBase
    {
        private readonly PaymentClient _paymentClient;

        public AdminPaymentController(PaymentClient paymentClient)
        {
            _paymentClient = paymentClient;
        }


        // =========================================================
        // GET ALL PAYMENTS
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAllPayments()
        {
            var jwtToken = GetJwtToken();

            var payments =
                await _paymentClient.GetAllPaymentsAsync(jwtToken);

            return Ok(payments);
        }


        // =========================================================
        // GET SUCCESSFUL PAYMENT COUNT
        // =========================================================

        [HttpGet("count")]
        public async Task<IActionResult> GetPaymentCount()
        {
            var jwtToken = GetJwtToken();

            var count =
                await _paymentClient.GetPaymentCountAsync(jwtToken);

            return Ok(new
            {
                totalSuccessfulPayments = count
            });
        }


        // =========================================================
        // GET TOTAL REVENUE
        // =========================================================

        [HttpGet("revenue")]
        public async Task<IActionResult> GetTotalRevenue()
        {
            var jwtToken = GetJwtToken();

            var revenue =
                await _paymentClient.GetTotalRevenueAsync(jwtToken);

            return Ok(new
            {
                totalRevenue = revenue
            });
        }


        // =========================================================
        // GET PAYMENT BY ID
        // =========================================================

        [HttpGet("{paymentId:long}")]
        public async Task<IActionResult> GetPaymentById(
            long paymentId)
        {
            var jwtToken = GetJwtToken();

            var payment =
                await _paymentClient.GetPaymentByIdAsync(
                    paymentId,
                    jwtToken
                );

            return Ok(payment);
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