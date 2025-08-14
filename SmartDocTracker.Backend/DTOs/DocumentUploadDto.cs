using Microsoft.AspNetCore.Mvc;

namespace SmartDocTracker.Backend.DTOs
{
    public sealed record DocumentUploadDto(
        string FileBase64,
        string FileName ,
        string Status ,
        Guid? AssignedToId ,
        string? comments 
    );

}
