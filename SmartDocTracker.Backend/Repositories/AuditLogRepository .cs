using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System;

namespace SmartDocTracker.Backend.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly SmartDocContext _context;

        public AuditLogRepository(SmartDocContext context)
        {
            _context = context;
        }

        public async Task AddLogAsync(Guid userId, Guid documentId, string action)
        {
            var log = new AuditLog
            {
                UserId = userId,
                DocumentId = documentId,
                Action = action,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLogDto>> GetLogsByDocumentIdAsync(Guid documentId)
        {
            return await _context.AuditLogs
      .Where(a => a.UserId == documentId)
      .Join(
          _context.Users,
          audit => audit.UserId,
          user => user.Id,
          (audit, user) => new { audit, user }
      )
      .Join(
          _context.Documents,
          combined => combined.audit.DocumentId,
          document => document.Id,
          (combined, document) => new AuditLogDto
          {
              Id = combined.audit.Id,
              UserId = combined.audit.UserId ?? Guid.Empty,
              FullName = combined.user.FullName,
              DocumentName = document.Title,
              Action = combined.audit.Action,
              Details = combined.audit.Details,
              Timestamp = combined.audit.Timestamp,
              DocumentId = combined.audit.DocumentId ?? Guid.Empty
          }
      )
      .ToListAsync();
        }
    }
    }
