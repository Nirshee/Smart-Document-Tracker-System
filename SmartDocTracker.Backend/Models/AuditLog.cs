using System;
using System.Collections.Generic;

namespace SmartDocTracker.Backend.Models;

public partial class AuditLog
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public string Action { get; set; } = null!;

    public string? Details { get; set; }

    public DateTime Timestamp { get; set; }

    public Guid? DocumentId { get; set; }

    public virtual Document? Document { get; set; }

    public virtual User? User { get; set; }
}
