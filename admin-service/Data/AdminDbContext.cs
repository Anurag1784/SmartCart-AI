using admin_service.Models;
using Microsoft.EntityFrameworkCore;

namespace admin_service.Data
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(
            DbContextOptions<AdminDbContext> options)
            : base(options)
        {
        }

        // =========================================================
        // AUDIT LOG TABLE
        // =========================================================

        public DbSet<AuditLog> AuditLogs { get; set; }
    }
}