using Microsoft.AspNetCore.Mvc;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Repositories.Interfaces;

namespace SmartDocTracker.Backend.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            
            app.MapPost("/register", async ([FromBody] RegisterDto dto, IAuthRepository repo) =>
            {
                var result = await repo.RegisterAsync(dto);
                return Results.Ok(result);
            });


            app.MapPost("/login", async ([FromBody] LoginDto dto, IAuthRepository repo) =>
            {
                var (isSuccess, message) = await repo.LoginAsync(dto);

                if (!isSuccess)
                    return Results.Unauthorized();

                return Results.Ok(new { token = message });
            });
        }
    }
    }
