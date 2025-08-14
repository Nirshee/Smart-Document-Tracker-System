using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;
using SmartDocTracker.Backend.Services;

namespace SmartDocTracker.Backend.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly SmartDocContext _context;
        private readonly IConfiguration _configuration;

        public AuthRepository(SmartDocContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return "User already exists.";

            var user = new Models.User
            {
                FullName = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = 3
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return "User registered successfully.";
        }

        public async Task<(bool IsSuccess, string Message)> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return (false, "Invalid credentials.");

            var token = JwtService.GenerateJwtToken(user, _configuration);
            return (true, token);
        }

    }
}
