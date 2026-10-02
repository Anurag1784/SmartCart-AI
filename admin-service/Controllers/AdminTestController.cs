using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/test")]
    [Authorize(Roles = "ADMIN")]
    public class AdminTestController : ControllerBase
    {
        [HttpGet]
        public IActionResult TestAdminAccess()
        {
            return Ok(new
            {
                message = "ADMIN authorization successful.",
                email = User.Identity?.Name,
                role = User.FindFirst("role")?.Value
            });
        }
    }
}