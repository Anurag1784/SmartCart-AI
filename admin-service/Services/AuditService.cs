using admin_service.Data;
using admin_service.Models;
using Microsoft.EntityFrameworkCore;

namespace admin_service.Services
{
    public class AuditService
    {
        private readonly AdminDbContext _dbContext;

        public AuditService(AdminDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // =========================================================
        // CREATE AUDIT LOG
        // =========================================================

        public async Task<AuditLog> LogAsync(
            string adminEmail,
            string action,
            string resource,
            long? resourceId,
            string result)
        {
            var auditLog = new AuditLog
            {
                AdminEmail = adminEmail,
                Action = action,
                Resource = resource,
                ResourceId = resourceId,
                Result = result,
                Timestamp = DateTime.UtcNow
            };

            _dbContext.AuditLogs.Add(auditLog);

            await _dbContext.SaveChangesAsync();

            return auditLog;
        }


        // =========================================================
        // GET ALL AUDIT LOGS
        // =========================================================

        public async Task<List<AuditLog>> GetAllAsync()
        {
            return await _dbContext.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
    }
}