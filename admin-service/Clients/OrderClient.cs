using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace admin_service.Clients
{
    public class OrderClient
    {
        private readonly HttpClient _httpClient;

        public OrderClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }


        // =========================================================
        // GET TOTAL ORDER COUNT
        // =========================================================

        public async Task<long> GetOrderCountAsync(
            string jwtToken)
        {
            // ---------------------------------------------------------
            // Forward the Admin JWT to Order Service.
            // ---------------------------------------------------------

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Call Order Service.
            // ---------------------------------------------------------

            var response = await _httpClient.GetAsync(
                "/api/orders/count"
            );

            // ---------------------------------------------------------
            // Throw an exception if Order Service
            // returns an error status code.
            // ---------------------------------------------------------

            response.EnsureSuccessStatusCode();

            // ---------------------------------------------------------
            // Order Service returns a plain number,
            // for example: 32
            // ---------------------------------------------------------

            var count =
                await response.Content.ReadFromJsonAsync<long>();

            return count;
        }


        // =========================================================
        // GET ALL ORDERS
        // =========================================================

        public async Task<List<OrderResponse>> GetAllOrdersAsync(
            string jwtToken)
        {
            // ---------------------------------------------------------
            // Forward the Admin JWT to Order Service.
            // ---------------------------------------------------------

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Call Order Service.
            // ---------------------------------------------------------

            var response = await _httpClient.GetAsync(
                "/api/orders"
            );

            // ---------------------------------------------------------
            // Throw an exception if Order Service
            // returns an error status code.
            // ---------------------------------------------------------

            response.EnsureSuccessStatusCode();

            // ---------------------------------------------------------
            // Convert the JSON response into a list of orders.
            // ---------------------------------------------------------

            var orders =
                await response.Content.ReadFromJsonAsync<
                    List<OrderResponse>
                >();

            return orders ?? new List<OrderResponse>();
        }


        // =========================================================
        // GET ORDER BY ID
        // =========================================================

        public async Task<OrderResponse?> GetOrderByIdAsync(
            long orderId,
            string jwtToken)
        {
            // ---------------------------------------------------------
            // Forward the Admin JWT to Order Service.
            // ---------------------------------------------------------

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Call Order Service for the specific order.
            // ---------------------------------------------------------

            var response = await _httpClient.GetAsync(
                $"/api/orders/{orderId}"
            );

            // ---------------------------------------------------------
            // Throw an exception if Order Service
            // returns an error status code.
            // ---------------------------------------------------------

            response.EnsureSuccessStatusCode();

            // ---------------------------------------------------------
            // Convert the JSON response into OrderResponse.
            // ---------------------------------------------------------

            var order =
                await response.Content.ReadFromJsonAsync<OrderResponse>();

            return order;
        }
    }


    // =============================================================
    // ORDER RESPONSE DTO
    // =============================================================

    public class OrderResponse
    {
        public long OrderId { get; set; }

        public long CustomerId { get; set; }

        public AddressResponse? Address { get; set; }

        public decimal TotalAmount { get; set; }

        public string OrderStatus { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime? CancelledAt { get; set; }

        public List<OrderItemResponse> OrderItems { get; set; }
            = new List<OrderItemResponse>();
    }


    // =============================================================
    // ADDRESS RESPONSE DTO
    // =============================================================

    public class AddressResponse
    {
        public long AddressId { get; set; }

        public long CustomerId { get; set; }

        public string AddressLine1 { get; set; } = string.Empty;

        public string? AddressLine2 { get; set; }

        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string AddressType { get; set; } = string.Empty;

        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; }
    }


    // =============================================================
    // ORDER ITEM RESPONSE DTO
    // =============================================================

    public class OrderItemResponse
    {
        public long OrderItemId { get; set; }

        public long ProductId { get; set; }

        public long SellerId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }
    }
}