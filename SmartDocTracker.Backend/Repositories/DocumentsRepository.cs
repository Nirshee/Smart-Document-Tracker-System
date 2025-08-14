using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System;

public class DocumentRepository : IDocumentsRepository
{
    private readonly SmartDocContext _context;
    private readonly IAuditLogRepository _auditLogRepository;


    public DocumentRepository(SmartDocContext context, IAuditLogRepository auditLogRepository   )
    {
        _context = context;
        _auditLogRepository = auditLogRepository;
    }

  
    public async Task<List<Document>> GetAllAsync(int page, int pageSize, string search, Guid userid)
    {
        search = string.IsNullOrWhiteSpace(search) ? "" : search.ToLower();

        var user = await _context.Users.FirstOrDefaultAsync(e => e.Id == userid && e.RoleId == 1);
        bool isAdmin = user != null;

        var query = _context.Documents.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(d => d.Title.ToLower().Contains(search));
        }

        if (!isAdmin)
        {
            query = query.Where(d => d.AssignedToId == userid);
        }
       

            return await query
             .Select(d => new Document
             {
                 Id = d.Id,
                 Title = d.Title,
                 FilePath = d.FilePath,
                 UploadDate = d.UploadDate,
                 IsEncrypted = d.IsEncrypted,
                 IsConverted = d.IsConverted,
                 Status = d.Status,
                 AssignedToId = d.AssignedToId
             })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
    }



    public async Task<DocumentListDto?> GetByIdAsync(Guid id)
    {
        var document = await _context.Documents.FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
            return null;

        return new DocumentListDto
        {
            Id = document.Id,
            Title = document.Title,
            FilePath = document.FilePath,
            UploadedById = document.UploadedById,
            UploadDate = document.UploadDate,
            comments = document.comments
        };
    }

    public async Task<Document?> GetByIdUpdateAsync(Guid id)
    {
        return await _context.Documents.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Document> UploadAsync(Document document)
    {
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return document;
    }

    public async Task<Document?> UpdateAsync(Document document)
    {
        var existing = await _context.Documents.FindAsync(document.Id);
        if (existing == null) return null;

        existing.Title = document.Title ?? existing.Title;
        existing.Status = document.Status ?? existing.Status;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<string?> UpdateStatusAsync(DocumentUpdateDto document)
    {
        var existing = await _context.Documents.FindAsync(document.Id);
        if (existing == null) return null;

        existing.comments = document.comments ?? existing.comments;
        existing.Status = document.Status ?? existing.Status;
        await _context.SaveChangesAsync();
        return "Status updated succesfully";
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null) return false;

        _context.Documents.Remove(document);

        await _auditLogRepository.AddLogAsync(document.UploadedById, document.Id, "deleted");
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task AddAsync(Document document)
    {
        await _context.AddAsync(document);
    }

    public async Task AddDocumentVersionAsync(Guid Docid, string Filepath,int version,Guid ID)
    {
        var DOC = new DocumentVersion
        {
            DocumentId = ID,
            FilePath = Filepath,
            VersionNumber = version,
            CreatedOn = DateTime.UtcNow
        };

        _context.DocumentVersions.Add(DOC);
        await _context.SaveChangesAsync();
    }
}