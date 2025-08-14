namespace SmartDocTracker.Backend.DTOs
{
    public class DocumentDto
    {
        public string Title { get; set; } = null!;
        public IFormFile File { get; set; } = null!;
        public string Status { get; set; } = "Active";
    }
}
