namespace SmartDocTracker.Backend.DTOs
{
    public class DocumentUpdateDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = null!;
        public string comments { get; set; }
    }
}
