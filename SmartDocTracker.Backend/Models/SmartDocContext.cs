using Microsoft.EntityFrameworkCore;
using SmartDocTracker.Backend.Models;

namespace SmartDocAPI.Data
{
    public class SmartDocContext : DbContext
    {
        public SmartDocContext(DbContextOptions<SmartDocContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Document> Documents { get; set; }

        public virtual DbSet<DocumentVersion> DocumentVersions { get; set; }

        public virtual DbSet<User> Users { get; set; }

        public virtual DbSet<AuditLog> AuditLogs { get; set; }

        public virtual DbSet<Role> Roles { get; set; }




    }
}
