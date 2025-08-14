using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System;

namespace SmartDocTracker.Backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly SmartDocContext _context;

        public UserRepository(SmartDocContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User?> GetCurrentUserAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var guid))
                return null;

            return await _context.Users.FindAsync(guid);
        }


        public async Task<List<User>> GetUserAsync()
        {
            return await _context.Users.Where(e => e.RoleId == 4).ToListAsync();
        }

        public async Task<List<User>> GetallUserAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }

}
