using System.Net.Http.Json;

namespace admin_service.Clients
{
    public class ProductClient
    {
        private readonly HttpClient _httpClient;

        public ProductClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // =========================================================
        // GET ALL CATEGORIES
        // =========================================================

        public async Task<List<CategoryResponse>> GetCategoriesAsync()
        {
            // Call Product Service category API.
            var response = await _httpClient.GetAsync(
                "/api/categories"
            );

            // Throw an exception if Product Service
            // returns an error status code.
            response.EnsureSuccessStatusCode();

            // Convert JSON response into a list of categories.
            var categories =
                await response.Content.ReadFromJsonAsync<
                    List<CategoryResponse>
                >();

            // Return the categories.
            return categories ?? new List<CategoryResponse>();
        }


        // =========================================================
        // CREATE CATEGORY
        // =========================================================

        public async Task<CategoryResponse> CreateCategoryAsync(
            CreateCategoryRequest request,
            string jwtToken)
        {
            // Forward the ADMIN JWT to Product Service.
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            // Send the category data to Product Service.
            var response = await _httpClient.PostAsJsonAsync(
                "/api/categories",
                request
            );

            // Throw an exception if Product Service
            // returns an error status code.
            response.EnsureSuccessStatusCode();

            // Convert the response JSON into CategoryResponse.
            var category =
                await response.Content.ReadFromJsonAsync<CategoryResponse>();

            return category!;
        }


        // =========================================================
        // UPDATE CATEGORY
        // =========================================================

        public async Task<CategoryResponse> UpdateCategoryAsync(
            long categoryId,
            CreateCategoryRequest request,
            string jwtToken)
        {
            // ---------------------------------------------------------
            // Forward the ADMIN JWT to Product Service.
            // ---------------------------------------------------------

            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Send updated category data to Product Service.
            // ---------------------------------------------------------

            var response = await _httpClient.PutAsJsonAsync(
                $"/api/categories/{categoryId}",
                request
            );

            // ---------------------------------------------------------
            // Throw an exception if Product Service returns
            // an error status code.
            // ---------------------------------------------------------

            response.EnsureSuccessStatusCode();

            // ---------------------------------------------------------
            // Convert the response JSON into CategoryResponse.
            // ---------------------------------------------------------

            var category =
                await response.Content.ReadFromJsonAsync<CategoryResponse>();

            return category!;
        }


        // =========================================================
        // DELETE CATEGORY
        // =========================================================

        public async Task DeleteCategoryAsync(
            long categoryId,
            string jwtToken)
        {
            // ---------------------------------------------------------
            // Forward the ADMIN JWT to Product Service.
            // ---------------------------------------------------------

            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            // ---------------------------------------------------------
            // Send DELETE request to Product Service.
            // ---------------------------------------------------------

            var response = await _httpClient.DeleteAsync(
                $"/api/categories/{categoryId}"
            );

            // ---------------------------------------------------------
            // Throw an exception if Product Service returns
            // an error status code.
            // ---------------------------------------------------------

            response.EnsureSuccessStatusCode();
        }


        // =========================================================
        // GET TOTAL PRODUCT COUNT
        // =========================================================

        public async Task<long> GetProductCountAsync()
        {
            // ---------------------------------------------------------
            // Call Product Service to get the total number
            // of products.
            // ---------------------------------------------------------

            var response = await _httpClient.GetAsync(
                "/api/products/count"
            );

            // ---------------------------------------------------------
            // Throw an exception if Product Service
            // returns an error status code.
            // ---------------------------------------------------------

            response.EnsureSuccessStatusCode();

            // ---------------------------------------------------------
            // Product Service returns a plain number,
            // for example: 7
            // ---------------------------------------------------------

            var count =
                await response.Content.ReadFromJsonAsync<long>();

            return count;
        }


        // =========================================================
        // GET ALL PRODUCTS
        // =========================================================

        public async Task<List<ProductResponse>> GetAllProductsAsync()
        {
            // Call Product Service to get all products.
            var response = await _httpClient.GetAsync(
                "/api/products"
            );

            // Throw an exception if Product Service
            // returns an error status code.
            response.EnsureSuccessStatusCode();

            // Convert JSON response into a list of products.
            var products =
                await response.Content.ReadFromJsonAsync<
                    List<ProductResponse>
                >();

            // Return the products.
            return products ?? new List<ProductResponse>();
        }
    }


    // =========================================================
    // CATEGORY RESPONSE DTO
    // =========================================================

    public class CategoryResponse
    {
        public long CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        // Product Service also returns the category description.
        public string? Description { get; set; }
    }


    // =========================================================
    // CREATE CATEGORY REQUEST DTO
    // =========================================================

    public class CreateCategoryRequest
    {
        public string CategoryName { get; set; } = string.Empty;

        public string? Description { get; set; }
    }


    // =========================================================
    // PRODUCT RESPONSE DTO
    // =========================================================

    public class ProductResponse
    {
        public long ProductId { get; set; }

        // Product Service returns the complete Category object.
        public CategoryResponse? Category { get; set; }

        public long SellerId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? Brand { get; set; }

        public string Sku { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public string? Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}