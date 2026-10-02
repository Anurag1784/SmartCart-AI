using admin_service.Clients;
using admin_service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/announcements")]
    [Authorize(Roles = "ADMIN")]
    public class AdminAnnouncementController : ControllerBase
    {
        private readonly AuthClient _authClient;
        private readonly NotificationClient _notificationClient;
        private readonly AuditService _auditService;

        public AdminAnnouncementController(
            AuthClient authClient,
            NotificationClient notificationClient,
            AuditService auditService)
        {
            _authClient = authClient;
            _notificationClient = notificationClient;
            _auditService = auditService;
        }

        // =========================================================
        // SEND ANNOUNCEMENT TO ONE USER
        // =========================================================

        [HttpPost("user/{userId}")]
        public async Task<IActionResult> SendToUser(
            long userId,
            [FromBody] AnnouncementRequest request)
        {
            // Get the ADMIN JWT from the current request.
            var jwtToken = GetJwtToken();

            // Create the notification for the selected user.
            await _notificationClient.CreateNotificationAsync(
                userId,
                request.Title,
                request.Message,
                jwtToken
            );

            // ---------------------------------------------------------
            // Record successful Admin action.
            // ---------------------------------------------------------

            var adminEmail =
                User.FindFirst("sub")?.Value ?? "UNKNOWN_ADMIN";

            await _auditService.LogAsync(
                adminEmail,
                "SEND_ANNOUNCEMENT",
                "ANNOUNCEMENT",
                userId,
                "SUCCESS"
            );

            return Ok(new
            {
                message = "Announcement sent successfully.",
                userId = userId
            });
        }


        // =========================================================
        // SEND ANNOUNCEMENT TO ALL CUSTOMERS AND SELLERS
        // =========================================================

        [HttpPost("all")]
        public async Task<IActionResult> SendToAllUsers(
            [FromBody] AnnouncementRequest request)
        {
            // Get the ADMIN JWT from the current request.
            var jwtToken = GetJwtToken();

            // Get all CUSTOMER user IDs.
            var customerIds =
                await _authClient.GetUserIdsByRoleAsync(
                    "CUSTOMER",
                    jwtToken
                );

            // Get all SELLER user IDs.
            var sellerIds =
                await _authClient.GetUserIdsByRoleAsync(
                    "SELLER",
                    jwtToken
                );

            // Combine both groups.
            var userIds =
                customerIds
                    .Concat(sellerIds)
                    .Distinct()
                    .ToList();

            // Send the announcement to every user.
            foreach (var userId in userIds)
            {
                await _notificationClient.CreateNotificationAsync(
                    userId,
                    request.Title,
                    request.Message,
                    jwtToken
                );
            }

            // ---------------------------------------------------------
            // Record successful broadcast announcement.
            // ResourceId is null because the announcement
            // was sent to multiple users.
            // ---------------------------------------------------------

            var adminEmail =
                User.FindFirst("sub")?.Value ?? "UNKNOWN_ADMIN";

            await _auditService.LogAsync(
                adminEmail,
                "SEND_ANNOUNCEMENT",
                "ANNOUNCEMENT",
                null,
                "SUCCESS"
            );

            return Ok(new
            {
                message = "Announcement sent successfully.",
                totalRecipients = userIds.Count
            });
        }


        // =========================================================
        // GET ADMIN JWT
        // =========================================================

        private string GetJwtToken()
        {
            return Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");
        }
    }


    // =============================================================
    // ANNOUNCEMENT REQUEST
    // =============================================================

    public class AnnouncementRequest
    {
        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
    }
}