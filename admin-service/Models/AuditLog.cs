using System.ComponentModel.DataAnnotations;

namespace admin_service.Models
{
    public class AuditLog
    {
        // =========================================================
        // PRIMARY KEY
        // =========================================================

        [Key]
        public long AuditId { get; set; }


        // =========================================================
        // ADMIN WHO PERFORMED THE ACTION
        // =========================================================

        [Required]
        [MaxLength(255)]
        public string AdminEmail { get; set; } = string.Empty;


        // =========================================================
        // ACTION PERFORMED
        // Example:
        // CREATE_CATEGORY
        // UPDATE_CATEGORY
        // DELETE_CATEGORY
        // SEND_ANNOUNCEMENT
        // =========================================================

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;


        // =========================================================
        // RESOURCE AFFECTED
        // Example:
        // CATEGORY
        // ANNOUNCEMENT
        // =========================================================

        [Required]
        [MaxLength(100)]
        public string Resource { get; set; } = string.Empty;


        // =========================================================
        // ID OF THE AFFECTED RESOURCE
        // Nullable because some actions may affect multiple users
        // or may not have one specific resource ID.
        // =========================================================

        public long? ResourceId { get; set; }


        // =========================================================
        // RESULT OF THE ACTION
        // Example:
        // SUCCESS
        // FAILED
        // =========================================================

        [Required]
        [MaxLength(50)]
        public string Result { get; set; } = string.Empty;


        // =========================================================
        // WHEN THE ACTION OCCURRED
        // =========================================================

        public DateTime Timestamp { get; set; }
    }
}