using System;
using System.Collections.Generic;

namespace SmartDocTracker.Backend.Models;

public partial class Document
{
    public Guid Id { get; set; }

    public string Title { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public Guid UploadedById { get; set; }

    public DateTime UploadDate { get; set; }

    public bool IsEncrypted { get; set; }

    public bool IsConverted { get; set; }

    public string Status { get; set; } = null!;

    public Guid? AssignedToId { get; set; }  // Nullable to allow unassigned documents

    public string? comments { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<DocumentVersion> DocumentVersions { get; set; } = new List<DocumentVersion>();

    public virtual User UploadedBy { get; set; } = null!;
}
