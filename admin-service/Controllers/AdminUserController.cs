using admin_service.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "ADMIN")]
    public class AdminUserController : ControllerBase
    {
        private readonly AuthClient _authClient;

        public AdminUserController(AuthClient authClient)
        {
            _authClient = authClient;
        }

        // =========================================================
        // GET USER COUNT BY ROLE
        // =========================================================

        [HttpGet("count/{role}")]
        public async Task<IActionResult> GetUserCount(string role)
        {
            // Get the JWT of the currently authenticated Admin.
            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // Ask Auth Service for the count.
            var count = await _authClient.GetUserCountAsync(
                role,
                jwtToken
            );

            return Ok(new
            {
                role = role,
                count = count
            });
        }

        // =========================================================
        // GET USERS BY ROLE
        // =========================================================

        [HttpGet("{role}")]
        public async Task<IActionResult> GetUsersByRole(
            string role)
        {
            // Get the JWT of the currently authenticated Admin.
            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // Ask Auth Service for the actual users.
            var users = await _authClient.GetUsersByRoleAsync(
                role,
                jwtToken
            );

            return Ok(users);
        }

        // =========================================================
        // UPDATE USER ACCOUNT STATUS
        // =========================================================

        [HttpPut("{userId}/status")]
        public async Task<IActionResult> UpdateUserAccountStatus(
            long userId,
            [FromBody] UpdateAccountStatusRequest request)
        {
            // Get the JWT of the currently authenticated Admin.
            var jwtToken = Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "");

            // Ask Auth Service to update the user's status.
            var result = await _authClient.UpdateUserAccountStatusAsync(
                userId,
                request.Status,
                jwtToken
            );

            return Ok(new
            {
                message = result
            });
        }
    }

    // =============================================================
    // UPDATE ACCOUNT STATUS REQUEST
    // =============================================================

    public class UpdateAccountStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}