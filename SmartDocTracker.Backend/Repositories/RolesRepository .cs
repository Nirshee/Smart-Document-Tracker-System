using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System;

namespace SmartDocTracker.Backend.Repositories
{
    public class RolesRepository : IRolesRepository
    {
        private readonly SmartDocContext _context;

        public RolesRepository(SmartDocContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Role>> GetAllAsync() => await _context.Roles.ToListAsync();

        public async Task<Role?> GetByIdAsync(int id) => await _context.Roles.FindAsync(id);

        public async Task AddAsync(Role role)
        {
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Role role)
        {
            _context.Roles.Update(role);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var role = await GetByIdAsync(id);
            if (role != null)
            {
                _context.Roles.Remove(role);
                await _context.SaveChangesAsync();
            }
        }
    }

}
