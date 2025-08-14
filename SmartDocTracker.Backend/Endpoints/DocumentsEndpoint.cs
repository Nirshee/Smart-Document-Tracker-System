using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using SmartDocTracker.Backend.DTOs;
using SmartDocTracker.Backend.Models;
using SmartDocTracker.Backend.Repositories.Interfaces;
using System;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;


namespace YourAppNamespace.Endpoints;

public static class DocumentsEndpoint
{
    public static void MapDocumentsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/documents").RequireAuthorization();


        group.MapPost("/upload", async (
    DocumentUploadDto dto,
    IDocumentsRepository repo,
    IAuditLogRepository auditLogRepo,
    ClaimsPrincipal user) =>
        {
            var userId = user.FindFirst("Id")?.Value;
            if (userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.FileBase64) || string.IsNullOrWhiteSpace(dto.FileName))
                return Results.BadRequest("Invalid file data.");

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            Directory.CreateDirectory(uploadsDir);
            var filename = Path.GetFileNameWithoutExtension(dto.FileName);
            var extension = Path.GetExtension(dto.FileName).ToLowerInvariant();
            var fileGuid = Guid.NewGuid();
            var tempFilePath = Path.Combine(uploadsDir, $"{fileGuid}{extension}");

            // Decode and save file
            var fileBytes = Convert.FromBase64String(dto.FileBase64);
            await File.WriteAllBytesAsync(tempFilePath, fileBytes);

            string finalFilePath = tempFilePath;
            bool converted = false;

            if (extension != ".pdf")
            {
                // Convert to PDF using LibreOffice
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = @"C:\Program Files\LibreOffice\program\soffice.exe",
                        Arguments = $"--headless --convert-to pdf \"{tempFilePath}\" --outdir \"{uploadsDir}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };

                process.Start();
                process.WaitForExit();

                var pdfFilePath = Path.ChangeExtension(tempFilePath, ".pdf");
                if (File.Exists(pdfFilePath))
                {
                    File.Delete(tempFilePath); // Delete original
                    finalFilePath = pdfFilePath;
                    converted = true;
                }
                else
                {
                    return Results.Problem("File conversion to PDF failed.");
                }
            }

            var document = new Document
            {
                Id = fileGuid,
                Title = filename,
                FilePath = finalFilePath,
                Status = dto.Status,
                UploadedById = Guid.Parse(userId),
                UploadDate = DateTime.UtcNow,
                IsEncrypted = false,
                IsConverted = converted,
                AssignedToId = dto.AssignedToId,
            };

            await repo.AddAsync(document);
            await repo.SaveChangesAsync();

            await repo.AddDocumentVersionAsync(Guid.Parse(userId), finalFilePath, 1, fileGuid);

            await auditLogRepo.AddLogAsync(Guid.Parse(userId), document.Id, "Uploaded");
            return Results.Ok("Document uploaded Sucessfully");
        });



        group.MapGet("/", async (
         IDocumentsRepository repo,
         ClaimsPrincipal user,
         int page = 1,
         int pageSize = 10,
         string search = "") =>
        {
            var userId = user.FindFirst("Id")?.Value;
            if (userId == null)
                return Results.Unauthorized();
            // Validate page and pageSize to be greater than 0
            if (page < 1 || pageSize < 1)
            {
                return Results.BadRequest("Page and pageSize must be greater than 0.");
            }

            // Ensure search is never null, and default to an empty string if so
            search = string.IsNullOrEmpty(search) ? "" : search.ToLower();

            // Retrieve documents with pagination and search filtering
            var docs = await repo.GetAllAsync(page, pageSize, search, Guid.Parse(userId));

            // If no documents found, return a NotFound result
            if (docs == null || !docs.Any())
            {
                return Results.NotFound("No documents found.");
            }

            return Results.Ok(docs);
        });

        group.MapGet("/{id:guid}", async (Guid id, IDocumentsRepository repo, IAuditLogRepository auditLogRepo) =>
        {
            var doc = await repo.GetByIdAsync(id);
            if (!File.Exists(doc.FilePath))
            {
                return Results.NotFound("File Not Found");
            }

            await auditLogRepo.AddLogAsync(doc.UploadedById, doc.Id, "viewed");

            byte[] filebytes = await File.ReadAllBytesAsync(doc.FilePath);
            string base64 = Convert.ToBase64String(filebytes);

            return Results.Ok(
                new
                {
                    Document = doc.Title,
                    Base64 = base64
                });
        });

        group.MapPut("/{id:guid}", async (Guid id, DocumentDto input, IDocumentsRepository repo, IAuditLogRepository auditLogRepo) =>
        {
            var existing = await repo.GetByIdUpdateAsync(id);
            if (existing == null) return Results.NotFound();

            existing.Title = input.Title;
            existing.Status = input.Status;

            await repo.UpdateAsync(existing);
            await auditLogRepo.AddLogAsync(existing.UploadedById, existing.Id, input.Status);

            return Results.Ok(existing);
        });

        group.MapDelete("/{id:guid}", async (Guid id, IDocumentsRepository repo) =>
        {
            var result = await repo.DeleteAsync(id);
            return result ? Results.Ok("Deleted sucessfully") : Results.NotFound();
        });

        bool IsValidPdf(byte[] fileBytes)
        {
            try
            {
                using var stream = new MemoryStream(fileBytes);
                // Check the first few bytes for PDF signature: %PDF
                byte[] header = new byte[4];
                stream.Read(header, 0, 4);
                return Encoding.ASCII.GetString(header) == "%PDF";
            }
            catch
            {
                return false;
            }
        }

        string EncryptFileContent(byte[] fileBytes)
        {
            return Convert.ToBase64String(fileBytes); // simple base64 encryption
        }

        group.MapPut("/UpdateDocstatus", async (
                ClaimsPrincipal user,
                IDocumentsRepository repo,
                [FromBody] DocumentUpdateDto updateDto) =>
        {
            var userId = user.FindFirst("Id")?.Value;

            if (userId == null)
                return Results.Unauthorized();

            var currentUser = await repo.GetByIdAsync(updateDto.Id);
            if (currentUser == null)
                return Results.NotFound();

            DocumentUpdateDto Updatedetials = new DocumentUpdateDto();
            Updatedetials.Id = currentUser.Id;
            Updatedetials.comments = updateDto.comments ?? currentUser.comments;
            Updatedetials.Status = updateDto.Status ?? currentUser.Status;
           
            await repo.UpdateStatusAsync(Updatedetials);
            await repo.SaveChangesAsync();

            return Results.NoContent();
        });


    }
}