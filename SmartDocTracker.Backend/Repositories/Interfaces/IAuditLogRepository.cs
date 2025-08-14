using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;

namespace SmartDocTracker.Backend.Repositories.Interfaces
{
    public interface IAuditLogRepository
    {
        Task AddLogAsync(Guid userId, Guid documentId, string action);
        Task<List<AuditLogDto>> GetLogsByDocumentIdAsync(Guid documentId);
    }
}
