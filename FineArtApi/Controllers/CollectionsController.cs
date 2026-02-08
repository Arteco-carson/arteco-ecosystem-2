using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FineArtApi.Data;
using FineArtApi.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using FineArtApi.Services;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace FineArtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CollectionsController : ControllerBase
    {
        private readonly ArtContext _context;
        private readonly IAuditService _auditService;
        private readonly IConfiguration _configuration;

        public CollectionsController(ArtContext context, IAuditService auditService, IConfiguration configuration)
        {
            _context = context;
            _auditService = auditService;
            _configuration = configuration;
        }

        // --- HELPER: Upload Image to Blob Storage ---
        private async Task<string?> UploadImageAsync(IFormFile file)
        {
            try
            {
                var connectionString = _configuration["AzureStorage:ConnectionString"];
                
                if (string.IsNullOrEmpty(connectionString)) 
                {
                    return "https://via.placeholder.com/400x400?text=Storage+Not+Configured";
                }

                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient("artworks");
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var blobClient = containerClient.GetBlobClient(fileName);

                await blobClient.UploadAsync(file.OpenReadStream(), new BlobHttpHeaders { ContentType = file.ContentType });

                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Blob Upload Failed: {ex.Message}");
                return null; 
            }
        }

        private string GetFullError(Exception ex)
        {
            var messages = new List<string> { ex.Message };
            var current = ex.InnerException;
            while (current != null)
            {
                messages.Add(current.Message);
                current = current.InnerException;
            }
            return string.Join(" | ", messages);
        }

        private int? GetCurrentProfileId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (claim != null && int.TryParse(claim.Value, out int id)) return id;
            return null;
        }

        // GET: api/collections
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCollections()
        {
            try 
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var collections = await _context.Collections
                    .Where(c => c.OwnerProfileId == profileId)
                    .Include(c => c.SubGroups)
                    .OrderByDescending(c => c.CollectionId)
                    .Select(c => new {
                        c.CollectionId,
                        c.Name, 
                        c.Description,
                        SubGroups = c.SubGroups.Select(sg => new {
                            sg.SubGroupId,
                            sg.Name,
                            Artworks = sg.Artworks.Select(a => new { a.ArtworkId }).ToList() 
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(collections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Get Failed", error = GetFullError(ex) });
            }
        }

        // GET: api/collections/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCollection(int id)
        {
            try
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var collection = await _context.Collections
                    .Include(c => c.SubGroups)
                    .ThenInclude(sg => sg.Artworks)
                    .ThenInclude(a => a.ArtworkImages)
                    .Include(c => c.SubGroups)
                    .ThenInclude(sg => sg.Artworks)
                    .ThenInclude(a => a.Artist)
                    .FirstOrDefaultAsync(c => c.CollectionId == id && c.OwnerProfileId == profileId);

                if (collection == null) return NotFound();

                var result = new
                {
                    collection.CollectionId,
                    collection.Name,
                    collection.Description,
                    SubGroups = collection.SubGroups.Select(sg => new
                    {
                        sg.SubGroupId,
                        sg.Name,
                        sg.Description,
                        Artworks = sg.Artworks.Select(a => new
                        {
                            a.ArtworkId,
                            a.Title,
                            ArtistName = a.Artist != null ? (a.Artist.Pseudonym ?? $"{a.Artist.FirstName} {a.Artist.LastName}") : "Unknown",
                            ImageUrl = a.ArtworkImages
                                .OrderByDescending(i => i.IsPrimary)
                                .Select(i => i.BlobUrl)
                                .FirstOrDefault()
                        }).ToList()
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Get Single Failed", error = GetFullError(ex) });
            }
        }

        // GET: api/collections/subgroup/5
        [HttpGet("subgroup/{id}")]
        public async Task<ActionResult<object>> GetSubGroup(int id)
        {
            try
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var subGroup = await _context.SubGroups
                    .Include(sg => sg.Collection)
                    .Include(sg => sg.Artworks)
                    .ThenInclude(a => a.Artist)
                    .Include(sg => sg.Artworks)
                    .ThenInclude(a => a.ArtworkImages)
                    .FirstOrDefaultAsync(sg => sg.SubGroupId == id);

                if (subGroup == null) return NotFound();
                
                // --- SAFETY CHECK (Updated) ---
                // If the collection was deleted but the group remains (orphaned), 
                // we handle it gracefully instead of crashing on null reference.
                if (subGroup.Collection == null) 
                {
                    return StatusCode(500, new { message = "Data Integrity Error: SubGroup has no parent Collection." });
                }

                if (subGroup.Collection.OwnerProfileId != profileId) return Forbid();

                var result = new
                {
                    subGroup.SubGroupId,
                    subGroup.Name,
                    subGroup.Description,
                    CollectionName = subGroup.Collection.Name,
                    CollectionId = subGroup.Collection.CollectionId,
                    Artworks = subGroup.Artworks.Select(a => new
                    {
                        a.ArtworkId,
                        a.Title,
                        ArtistName = a.Artist != null ? (a.Artist.Pseudonym ?? $"{a.Artist.FirstName} {a.Artist.LastName}") : "Unknown",
                        ImageUrl = a.ArtworkImages
                                .OrderByDescending(i => i.IsPrimary)
                                .Select(i => i.BlobUrl)
                                .FirstOrDefault(),
                         a.Medium,
                         a.YearCreated,
                         a.Dimensions
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Get Group Failed", error = GetFullError(ex) });
            }
        }

        // --- CREATE ITEM IN GROUP ---
        [HttpPost("subgroup/{subGroupId}/item")]
        public async Task<IActionResult> CreateArtworkInGroup(int subGroupId, [FromForm] CreateArtworkInGroupDto dto)
        {
            try
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var subGroup = await _context.SubGroups
                    .Include(sg => sg.Collection)
                    .FirstOrDefaultAsync(sg => sg.SubGroupId == subGroupId);

                if (subGroup == null) return NotFound("Group not found");
                if (subGroup.Collection == null || subGroup.Collection.OwnerProfileId != profileId) return Forbid();

                // Handle Artist
                int? artistId = null;
                if (!string.IsNullOrWhiteSpace(dto.ArtistName))
                {
                    var existingArtist = await _context.Artists
                        .FirstOrDefaultAsync(a => a.LastName == dto.ArtistName || a.Pseudonym == dto.ArtistName);

                    if (existingArtist != null)
                    {
                        artistId = existingArtist.ArtistId;
                    }
                    else
                    {
                        var newArtist = new Artist
                        {
                            LastName = dto.ArtistName, 
                            Pseudonym = dto.ArtistName,
                            CreatedAt = DateTime.UtcNow,
                            LastModifiedAt = DateTime.UtcNow
                        };
                        _context.Artists.Add(newArtist);
                        await _context.SaveChangesAsync();
                        artistId = newArtist.ArtistId;
                    }
                }

                // Create Artwork
                var artwork = new Artwork
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Medium = dto.Medium,
                    Dimensions = dto.Dimensions,
                    YearCreated = dto.YearCreated,
                    SubGroupId = subGroupId,
                    ArtistId = artistId,
                    CreatedByProfileId = profileId.Value,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };

                _context.Artworks.Add(artwork);
                await _context.SaveChangesAsync();

                // Handle Image
                if (dto.ImageFile != null)
                {
                    var blobUrl = await UploadImageAsync(dto.ImageFile);
                    if (blobUrl != null)
                    {
                        var image = new ArtworkImage
                        {
                            ArtworkId = artwork.ArtworkId,
                            BlobUrl = blobUrl,
                            IsPrimary = true,
                            UploadedAt = DateTime.UtcNow,
                            LastModifiedAt = DateTime.UtcNow
                        };
                        _context.ArtworkImages.Add(image);
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { message = "Item created", artworkId = artwork.ArtworkId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Create Item Failed", error = GetFullError(ex) });
            }
        }

        // POST: api/collections
        [HttpPost]
        public async Task<ActionResult<object>> CreateCollection([FromBody] CollectionCreateDto dto)
        {
            try 
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var collection = new Collection
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    OwnerProfileId = profileId.Value,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };

                _context.Collections.Add(collection);
                await _context.SaveChangesAsync();

                var defaultGroup = new SubGroup
                {
                    Name = "-",
                    Description = "Default Group",
                    CollectionId = collection.CollectionId,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };

                _context.SubGroups.Add(defaultGroup);
                await _context.SaveChangesAsync();

                try {
                    await _auditService.LogAsync("Collections", collection.CollectionId, "INSERT", profileId.Value, null, new { collection.Name });
                } catch { }

                return CreatedAtAction(nameof(GetCollection), new { id = collection.CollectionId }, new { collection.CollectionId, collection.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Create Failed", error = GetFullError(ex) });
            }
        }

        // POST: api/collections/subgroup
        [HttpPost("subgroup")]
        public async Task<ActionResult<object>> CreateSubGroup([FromBody] SubGroupCreateDto dto)
        {
            try
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var collection = await _context.Collections.FindAsync(dto.CollectionId);
                if (collection == null) return NotFound("Collection not found");
                if (collection.OwnerProfileId != profileId) return Forbid();

                var subGroup = new SubGroup
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    CollectionId = dto.CollectionId,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };

                _context.SubGroups.Add(subGroup);
                await _context.SaveChangesAsync();

                try {
                     await _auditService.LogAsync("SubGroups", subGroup.SubGroupId, "INSERT", profileId.Value, null, new { subGroup.Name });
                } catch { }

                return Ok(new { subGroup.SubGroupId, subGroup.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Create Group Failed", error = GetFullError(ex) });
            }
        }

        // DELETE: api/collections/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCollection(int id)
        {
            try
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var collection = await _context.Collections.FindAsync(id);
                if (collection == null) return NotFound();
                if (collection.OwnerProfileId != profileId) return Forbid();

                _context.Collections.Remove(collection);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Delete Failed", error = GetFullError(ex) });
            }
        }
    }

    // --- DTOs ---
    public class CollectionCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public List<int> ArtworkIds { get; set; } = new List<int>();
    }

    public class SubGroupCreateDto
    {
        [Required]
        public int CollectionId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }
    }

    public class CreateArtworkInGroupDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? ArtistName { get; set; }
        public string? Description { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public int? YearCreated { get; set; }

        public IFormFile? ImageFile { get; set; }
    }
}