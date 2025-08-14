using System;
using System.Collections.Generic;

namespace SmartDocTracker.Backend.Models;

public partial class DocumentVersion
{
    public Guid Id { get; set; }

    public Guid DocumentId { get; set; }

    public int VersionNumber { get; set; }

    public string FilePath { get; set; } = null!;

    public DateTime CreatedOn { get; set; }

    public virtual Document Document { get; set; } = null!;
}
