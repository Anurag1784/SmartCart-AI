using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace admin_service.Clients
{
    public class NotificationClient
    {
        private readonly HttpClient _httpClient;

        public NotificationClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // =========================================================
        // CREATE NOTIFICATION FOR ONE USER
        // =========================================================

        public async Task CreateNotificationAsync(
            long userId,
            string title,
            string message,
            string jwtToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    jwtToken
                );

            var request = new NotificationRequest
            {
                UserId = userId,
                NotificationType = "ANNOUNCEMENT",
                Title = title,
                Message = message
            };

            var response =
                await _httpClient.PostAsJsonAsync(
                    "/api/notifications",
                    request
                );

            response.EnsureSuccessStatusCode();
        }
    }

    // =========================================================
    // REQUEST MODEL
    // =========================================================

    public class NotificationRequest
    {
        public long UserId { get; set; }

        public string NotificationType { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
    }
}