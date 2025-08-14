using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System;

namespace SmartDocTracker.Backend.Repositories
{
    public class LookupRepository : ILookupRepository
    {
        private readonly SmartDocContext _context;

        public LookupRepository(SmartDocContext context)
        {
            _context = context;
        }

        public Task<List<string>> GetStatusesAsync()
        {
            var statuses = new List<string>
        {
            "Pending",
            "Approved",
            "Rejected",
            "Converted"
        };

            return Task.FromResult(statuses);
        }

        public async Task<List<Role>> GetRolesAsync()
        {
            return await _context.Roles.ToListAsync();
        }
    }

}
