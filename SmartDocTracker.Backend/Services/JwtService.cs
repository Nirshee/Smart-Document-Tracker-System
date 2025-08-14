using Microsoft.IdentityModel.Tokens;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartDocTracker.Backend.Services
{
    public static class JwtService
    {
        public static string GenerateJwtToken(SmartDocTracker.Backend.Models.User user, IConfiguration configuration)
        {
            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, configuration["Jwt:Subject"]),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64), // FIXED
        new Claim("Id", user.Id.ToString()),
        new Claim("Username", user.FullName),
        new Claim("Role", user.RoleId.ToString()),
        new Claim("Email", user.Email)
    };

            var keyString = configuration["Jwt:Key"].Trim();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);



            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds

            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        }

    }
