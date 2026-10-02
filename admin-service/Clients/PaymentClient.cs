using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace admin_service.Clients
{
    public class PaymentClient
    {
        private readonly HttpClient _httpClient;

        public PaymentClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // =========================================================
        // GET SUCCESSFUL PAYMENT COUNT
        // =========================================================

        public async Task<long> GetPaymentCountAsync(
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                "/api/payments/count"
            );

            response.EnsureSuccessStatusCode();

            var count =
                await response.Content.ReadFromJsonAsync<long>();

            return count;
        }


        // =========================================================
        // GET TOTAL REVENUE
        // =========================================================

        public async Task<decimal> GetTotalRevenueAsync(
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                "/api/payments/revenue"
            );

            response.EnsureSuccessStatusCode();

            var revenue =
                await response.Content.ReadFromJsonAsync<decimal>();

            return revenue;
        }


        // =========================================================
        // ADMIN - GET ALL PAYMENTS
        // =========================================================

        public async Task<List<PaymentResponse>> GetAllPaymentsAsync(
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                "/api/payments"
            );

            response.EnsureSuccessStatusCode();

            var payments =
                await response.Content.ReadFromJsonAsync<List<PaymentResponse>>();

            return payments ?? new List<PaymentResponse>();
        }

        // =========================================================
        // GET PAYMENT BY ID
        // =========================================================

        public async Task<PaymentResponse> GetPaymentByIdAsync(
            long paymentId,
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                $"/api/payments/{paymentId}"
            );

            response.EnsureSuccessStatusCode();

            var payment =
                await response.Content.ReadFromJsonAsync<PaymentResponse>();

            return payment!;
        }
    }


    // =============================================================
    // PAYMENT RESPONSE
    // Maps Payment Service JSON → Admin Service object
    // =============================================================

    public class PaymentResponse
    {
        public long PaymentId { get; set; }

        public long OrderId { get; set; }

        public long CustomerId { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string? GatewayOrderId { get; set; }

        public string? GatewayPaymentId { get; set; }

        public string PaymentStatus { get; set; } = string.Empty;

        public string? FailureReason { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}