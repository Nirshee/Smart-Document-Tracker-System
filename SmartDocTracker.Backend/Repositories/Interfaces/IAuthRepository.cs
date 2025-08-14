using SmartDocTracker.Backend.DTOs;

namespace SmartDocTracker.Backend.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<string> RegisterAsync(RegisterDto registerDto);
        Task<(bool IsSuccess, string Message)> LoginAsync(LoginDto dto);
    }
}
