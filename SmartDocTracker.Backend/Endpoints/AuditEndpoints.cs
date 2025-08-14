using SmartDocTracker.Backend.Repositories.Interfaces;
using System.Security.Claims;

namespace SmartDocTracker.Backend.Endpoints
{
    public static class AuditEndpoints
    {
        public static void MapAuditEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/audit", async ( IAuditLogRepository repository,ClaimsPrincipal user ) =>
            {
                var userId = user.FindFirst("Id")?.Value;
                if (userId == null)
                    return Results.Unauthorized();


                var logs = await repository.GetLogsByDocumentIdAsync(Guid.Parse(userId));
                return Results.Ok(logs.Select(log => new
                {
                    log.Id,
                    log.FullName,
                    log.DocumentName,
                    log.Action,
                    log.Timestamp,
                }));
            });
        }
    }

}
