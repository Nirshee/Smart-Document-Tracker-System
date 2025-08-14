using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System.Security.Claims;

namespace SmartDocTracker.Backend.Endpoints
{

    public static class UserEndpoints
    {

        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/users").RequireAuthorization();

            group.MapGet("/me", async (
                ClaimsPrincipal user,
                IUserRepository repo) =>
            {
                var userId = user.FindFirst("Id")?.Value;

                if (userId == null)
                    return Results.Unauthorized();

                var currentUser = await repo.GetCurrentUserAsync(userId);
                if (currentUser == null)
                    return Results.NotFound();

                var dto = new UserDto
                {
                    Id = currentUser.Id,
                    Username = currentUser.FullName,
                    Email = currentUser.Email
                };

                return Results.Ok(dto);
            });

            group.MapPut("/me", async (
                ClaimsPrincipal user,
                IUserRepository repo,
                [FromBody] UserUpdateDto updateDto) =>
            {
                var userId = user.FindFirst("Id")?.Value;

                if (userId == null)
                    return Results.Unauthorized();

                var currentUser = await repo.GetCurrentUserAsync(updateDto.Id.ToString());
                if (currentUser == null)
                    return Results.NotFound();

                currentUser.FullName = updateDto.FullName ?? currentUser.FullName;
                currentUser.Email = updateDto.Email ?? currentUser.Email;
                currentUser.RoleId = int.Parse(updateDto.Role); 

                await repo.UpdateUserAsync(currentUser);
                await repo.SaveChangesAsync();

                return Results.NoContent();
            });

        
            group.MapGet("/user/Getuser", async (IUserRepository repository) =>
            {
                var roles = await repository.GetUserAsync();
                var result = roles.Select(r => new { r.Id, r.FullName }).ToList();
                return Results.Ok(result);
            });
            group.MapGet("/user/Getalluser", async (IUserRepository repository) =>
            {
                var roles = await repository.GetallUserAsync();
                var result = roles.Select(r => new { r.Id, r.FullName,r.Email,r.RoleId }).ToList();
                return Results.Ok(result);
            });

        }

    }

}
