
using SmartDocTracker.Backend.Models;

namespace SmartDocTracker.Backend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetCurrentUserAsync(string userId);
        Task<List<User>> GetUserAsync();
        Task<List<User>> GetallUserAsync();
        Task UpdateUserAsync(User user);
        Task SaveChangesAsync();
    }
}
