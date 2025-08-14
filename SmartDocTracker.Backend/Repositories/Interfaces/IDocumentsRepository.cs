using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;

namespace SmartDocTracker.Backend.Repositories.Interfaces
{
    public interface IDocumentsRepository
    {
        Task<List<Document>> GetAllAsync(int page, int pageSize,string search, Guid userid);

        Task<DocumentListDto?> GetByIdAsync(Guid id);

        Task<Document?> GetByIdUpdateAsync(Guid id);

        Task AddDocumentVersionAsync(Guid Docid, string Filepath, int versions, Guid ID);

        Task<Document> UploadAsync(Document document);
        Task<Document?> UpdateAsync(Document document);
        Task<string?> UpdateStatusAsync(DocumentUpdateDto document);
        Task<bool> DeleteAsync(Guid id);
        Task SaveChangesAsync();
        Task AddAsync(Document document);
    }
}
