namespace SmartDocTracker.Backend.DTOs
{
    public class UserUpdateDto
    {
        public Guid Id { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }
    }
}
