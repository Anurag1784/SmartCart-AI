using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace admin_service.Clients
{
    public class AuthClient
    {
        private readonly HttpClient _httpClient;

        public AuthClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // =========================================================
        // GET USER COUNT BY ROLE
        // =========================================================

        public async Task<long> GetUserCountAsync(
            string role,
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                $"/api/auth/admin/user-count?role={role}"
            );

            response.EnsureSuccessStatusCode();

            var count =
                await response.Content.ReadFromJsonAsync<long>();

            return count;
        }

        // =========================================================
        // GET USER IDS BY ROLE
        // =========================================================

        public async Task<List<long>> GetUserIdsByRoleAsync(
            string role,
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            /*
             * The Auth Service already provides:
             *
             * GET /api/auth/admin/users?role=...
             *
             * That endpoint returns AdminUserResponse objects
             * containing UserId.
             *
             * We reuse that existing endpoint instead of creating
             * another /user-ids endpoint.
             */

            var response = await _httpClient.GetAsync(
                $"/api/auth/admin/users?role={role}"
            );

            response.EnsureSuccessStatusCode();

            var users =
                await response.Content
                    .ReadFromJsonAsync<List<AdminUserResponse>>();

            /*
             * Extract only the user IDs because the
             * announcement controller only needs IDs.
             */

            return users?
                .Select(user => user.UserId)
                .ToList()
                ?? new List<long>();
        }

        // =========================================================
        // GET USERS BY ROLE
        // =========================================================

        public async Task<List<AdminUserResponse>> GetUsersByRoleAsync(
            string role,
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var response = await _httpClient.GetAsync(
                $"/api/auth/admin/users?role={role}"
            );

            response.EnsureSuccessStatusCode();

            var users =
                await response.Content
                    .ReadFromJsonAsync<List<AdminUserResponse>>();

            return users ?? new List<AdminUserResponse>();
        }

        // =========================================================
        // UPDATE USER ACCOUNT STATUS
        // =========================================================

        public async Task<string> UpdateUserAccountStatusAsync(
            long userId,
            string status,
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var request = new
            {
                status = status
            };

            var response = await _httpClient.PutAsJsonAsync(
                $"/api/auth/admin/users/{userId}/status",
                request
            );

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content.ReadAsStringAsync();

            return result;
        }
    }

    // =============================================================
    // ADMIN USER RESPONSE
    // =============================================================

    public class AdminUserResponse
    {
        public long UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string Role { get; set; } = string.Empty;

        public string AccountStatus { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}