using SmartDocTracker.Backend.Models;

namespace SmartDocTracker.Backend.Repositories.Interfaces
{
    public interface ILookupRepository
    {
        Task<List<string>> GetStatusesAsync();
        Task<List<Role>> GetRolesAsync();
    }
}
