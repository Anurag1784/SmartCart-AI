using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace admin_service.Clients
{
    public class InventoryClient
    {
        private readonly HttpClient _httpClient;

        public InventoryClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }


        // =========================================================
        // GET LOW-STOCK INVENTORY
        // =========================================================

        public async Task<List<InventoryResponse>> GetLowStockInventoryAsync(
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                "/api/inventory/low-stock"
            );

            response.EnsureSuccessStatusCode();

            var inventory =
                await response.Content.ReadFromJsonAsync<List<InventoryResponse>>();

            return inventory ?? new List<InventoryResponse>();
        }


        // =========================================================
        // ADMIN - GET ALL INVENTORY
        // =========================================================

        public async Task<List<InventoryResponse>> GetAllInventoryAsync(
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                "/api/inventory"
            );

            response.EnsureSuccessStatusCode();

            var inventory =
                await response.Content.ReadFromJsonAsync<List<InventoryResponse>>();

            return inventory ?? new List<InventoryResponse>();
        }
    }


    // =============================================================
    // INVENTORY RESPONSE
    // =============================================================

    public class InventoryResponse
    {
        public long InventoryId { get; set; }

        public long ProductId { get; set; }

        public int AvailableQuantity { get; set; }

        public int ReservedQuantity { get; set; }

        public int ReorderLevel { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}