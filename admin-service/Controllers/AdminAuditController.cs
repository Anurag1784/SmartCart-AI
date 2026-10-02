using admin_service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace admin_service.Controllers
{
    [ApiController]
    [Route("api/admin/audit")]
    [Authorize(Roles = "ADMIN")]
    public class AdminAuditController : ControllerBase
    {
        private readonly AuditService _auditService;

        public AdminAuditController(AuditService auditService)
        {
            _auditService = auditService;
        }

        // =========================================================
        // GET ALL AUDIT LOGS
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAllAuditLogs()
        {
            var auditLogs = await _auditService.GetAllAsync();

            return Ok(auditLogs);
        }
    }
}