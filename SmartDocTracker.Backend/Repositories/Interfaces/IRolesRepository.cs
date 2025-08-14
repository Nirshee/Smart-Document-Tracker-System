using SmartDocTracker.Backend.Models;

namespace SmartDocTracker.Backend.Repositories.Interfaces
{
    public interface IRolesRepository
    {
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role?> GetByIdAsync(int id);
        Task AddAsync(Role role);
        Task UpdateAsync(Role role);
        Task DeleteAsync(int id);
    }
}
