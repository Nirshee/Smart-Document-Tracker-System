using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;

namespace SmartDocTracker.Backend.Endpoints
{
    public static class RolesEndpoint
    {
        public static void MapRolesEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/admin/roles").RequireAuthorization("AdminPolicy");

            group.MapGet("/", async (IRolesRepository repo) =>
            {
                var roles = await repo.GetAllAsync();
                return Results.Ok(roles);
            });

            group.MapPost("/", async (RoleDto dto, IRolesRepository repo) =>
            {
                var role = new Role { Name = dto.Name };
                await repo.AddAsync(role);
                return Results.Created($"/api/admin/roles/{role.Id}", role);
            });

            group.MapPut("/{id:int}", async (int id, RoleDto dto, IRolesRepository repo) =>
            {
                var existing = await repo.GetByIdAsync(id);
                if (existing is null)
                    return Results.NotFound();

                existing.Name = dto.Name;
                await repo.UpdateAsync(existing);
                return Results.Ok(existing);
            });

            group.MapDelete("/{id:int}", async (int id, IRolesRepository repo) =>
            {
                var existing = await repo.GetByIdAsync(id);
                if (existing is null)
                    return Results.NotFound();

                await repo.DeleteAsync(id);
                return Results.NoContent();
            });
        }
    }

}
