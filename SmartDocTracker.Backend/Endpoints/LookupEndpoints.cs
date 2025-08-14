using Microsoft.EntityFrameworkCore;
using SmartDocAPI.Data;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System.Security.Claims;

namespace SmartDocTracker.Backend.Endpoints
{
    public static class LookupEndpoints
    {
        public static void MapLookupEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/lookup/statuses", async (ILookupRepository repository,ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst("Id")?.Value;
                if (userId == null)
                    return Results.Unauthorized();
                var statuses = await repository.GetStatusesAsync();
                return Results.Ok(statuses);
            });

            app.MapGet("/api/lookup/roles", async (ILookupRepository repository, ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst("Id")?.Value;
                if (userId == null)
                    return Results.Unauthorized();
                var roles = await repository.GetRolesAsync();
                var result = roles.Select(r => new { r.Id, r.Name }).ToList();
                return Results.Ok(result);
            });

            app.MapGet("/api/lookup/Dashboard", async (ILookupRepository repository, ClaimsPrincipal user,SmartDocContext _context) =>
            {
                var userId = user.FindFirst("Id")?.Value;
                if (userId == null)
                    return Results.Unauthorized();

                var totalUploadDoc = await _context.AuditLogs.CountAsync(a => a.Action == "Uploaded");
                var totalDeletedDoc = await _context.AuditLogs.CountAsync(a => a.Action == "deleted");
                var totalViewedDoc = await _context.AuditLogs.CountAsync(a => a.Action == "viewed");

                var result = new
                {
                    totaluploaddoc = totalUploadDoc,
                    totaldeleteddoc = totalDeletedDoc,
                    totalvieweddoc = totalViewedDoc
                };

                return Results.Ok(result);

            });
        }
    }

}
