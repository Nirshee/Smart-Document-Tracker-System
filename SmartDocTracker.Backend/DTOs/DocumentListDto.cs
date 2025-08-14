namespace SmartDocTracker.Backend.DTOs
{
    public class DocumentListDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = null!;

        public string FilePath { get; set; } = null!;

        public Guid UploadedById { get; set; }

        public DateTime UploadDate { get; set; }

        public bool IsEncrypted { get; set; }

        public bool IsConverted { get; set; }

        public string Status { get; set; } = null!;

        public string? comments { get; set; } = null;

        public virtual User UploadedBy { get; set; } = null!;

    }
}
