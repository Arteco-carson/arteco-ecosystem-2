using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FineArtApi.Data;
using FineArtApi.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using FineArtApi.Services;

namespace FineArtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ArtworksController : ControllerBase
    {
        private readonly ArtContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        private readonly IAuditService _auditService;

        public ArtworksController(ArtContext context, IWebHostEnvironment env, IConfiguration configuration, IAuditService auditService)
        {
            _context = context;
            _env = env;
            _configuration = configuration;
            _auditService = auditService;
        }

        [HttpPost("upload-images")]
        public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            var imageUrls = new List<string>();
            
            string connectionString = _configuration["AzureStorage:ConnectionString"] ?? string.Empty;
            string containerName = _configuration["AzureStorage:ContainerName"] ?? "artworks";

            if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("YOUR_AZURE_CONNECTION_STRING"))
            {
                return StatusCode(500, "Azure Storage connection string is not configured. Please check appsettings.json.");
            }

            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var blobClient = containerClient.GetBlobClient(fileName);

                    using (var stream = file.OpenReadStream())
                    {
                        var blobHttpHeader = new BlobHttpHeaders { ContentType = file.ContentType };
                        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = blobHttpHeader });
                    }
                    
                    imageUrls.Add(blobClient.Uri.ToString());
                }
            }

            return Ok(new { imageUrls });
        }
        
        [HttpGet("editions")]
        public async Task<ActionResult<IEnumerable<object>>> GetEditions()
        {
            return await _context.Set<Edition>()
                .Select(e => new {
                    e.EditionId,
                    e.EditionType,
                    e.Marking,
                    e.Rarity,
                    e.EstimatedValueRelative
                })
                .ToListAsync();
        }

        // NEW: Endpoint for user-scoped artwork inventory (ISO27001 Compliance)
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserArtworks([FromQuery] int? collectionId, [FromQuery] bool unassigned = false)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            // FIXED: Use SubGroup logic instead of CollectionArtworks
            var query = _context.Artworks
                .Include(a => a.Artist)
                .Include(a => a.ArtworkImages)
                .Include(a => a.SubGroup)
                .ThenInclude(sg => sg.Collection) // Navigate up to Collection
                .Where(a => (a.SubGroup != null && a.SubGroup.Collection.OwnerProfileId == profileId) 
                            || a.CreatedByProfileId == profileId)
                .AsQueryable();

            if (unassigned)
            {
                query = query.Where(a => a.SubGroupId == null);
            }
            else if (collectionId.HasValue)
            {
                // Filter by CollectionId via the SubGroup
                query = query.Where(a => a.SubGroup != null && a.SubGroup.CollectionId == collectionId.Value);
            }

            var results = await query.Select(a => new {
                a.ArtworkId,
                a.Title,
                ArtistName = a.Artist != null ? $"{a.Artist.FirstName} {a.Artist.LastName}" : "Unknown",
                a.AcquisitionCost, // Values in GBP
                a.Status,
                ImageUrl = a.ArtworkImages.OrderByDescending(i => i.IsPrimary).Select(i => i.BlobUrl).FirstOrDefault(),
                ArtworkImages = a.ArtworkImages.Select(i => new { Id = i.ImageId, i.BlobUrl, i.IsPrimary }).ToList()
            }).ToListAsync();

            return Ok(results);
        }

        // NEW: Endpoint for Employees to fetch a specific customer's inventory
        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetArtworksByOwner(int ownerId)
        {
            var userTypeClaim = User.FindFirst("usertype");
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if ((userTypeClaim == null || userTypeClaim.Value != "Employee") && (roleClaim == null || roleClaim.Value != "Administrator"))
            {
                return Forbid();
            }

            var results = await _context.Artworks
                .Where(a => a.CreatedByProfileId == ownerId)
                .Select(a => new {
                    id = a.ArtworkId,
                    title = a.Title,
                    artist = a.Artist != null ? $"{a.Artist.FirstName} {a.Artist.LastName}" : "Unknown",
                    ownerId = a.CreatedByProfileId
                }).ToListAsync();

            return Ok(results);
        }

        [HttpGet("user/artists")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserArtists()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            // FIXED: Use SubGroup logic
            var artists = await _context.Artworks
                .Where(a => a.CreatedByProfileId == profileId || (a.SubGroup != null && a.SubGroup.Collection.OwnerProfileId == profileId))
                .Where(a => a.Artist != null)
                .Select(a => new {
                    a.Artist!.ArtistId,
                    a.Artist!.FirstName,
                    a.Artist!.LastName,
                    a.Artist!.Nationality,
                    ProfileImageUrl = a.Artist!.ProfileImageUrl
                })
                .Distinct()
                .ToListAsync();

            return Ok(artists);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetArtworks(
            [FromQuery] int? collectionId = null, 
            [FromQuery] int? artistId = null)
        {
            // FIXED: Include SubGroup path
            var query = _context.Artworks
                .Include(a => a.ArtworkImages)
                .Include(a => a.Artist)
                .Include(a => a.SubGroup)
                .ThenInclude(sg => sg.Collection)
                .AsQueryable();

            if (collectionId.HasValue)
            {
                // FIXED: Filter by SubGroup.CollectionId
                query = query.Where(a => a.SubGroup != null && a.SubGroup.CollectionId == collectionId.Value);
            }

            if (artistId.HasValue)
            {
                query = query.Where(a => a.ArtistId == artistId.Value);
            }

            var results = await query.Select(a => new {
                a.ArtworkId,
                a.Title,
                a.ArtistId,
                ArtistName = a.Artist != null ? $"{a.Artist.FirstName} {a.Artist.LastName}" : "Unknown",
                a.Medium,
                a.HeightCM,
                a.WidthCM,
                a.AcquisitionCost,
                a.Status,
                ImageUrl = a.ArtworkImages.OrderByDescending(i => i.IsPrimary).Select(i => i.BlobUrl).FirstOrDefault(),
                // FIXED: Wrap single collection name in a list to maintain legacy JSON shape
                Collections = a.SubGroup != null ? new List<string> { a.SubGroup.Collection.Name } : new List<string>(),
                ArtworkImages = a.ArtworkImages.Select(i => new { Id = i.ImageId, i.BlobUrl, i.IsPrimary }).ToList()
            }).ToListAsync();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetArtwork(int id)
        {
          try
          {
            var artwork = await _context.Artworks
                .Include(a => a.ArtworkImages)
                .Include(a => a.Artist) 
                .Include(a => a.Edition)
                // FIXED: Include SubGroup path
                .Include(a => a.SubGroup)
                .ThenInclude(sg => sg.Collection)
                .FirstOrDefaultAsync(a => a.ArtworkId == id);

            if (artwork == null) return NotFound();

            return Ok(new
            {
              artwork.ArtworkId,
              artwork.Title,
              artwork.ArtistId,
              ArtistName = artwork.Artist != null ? $"{artwork.Artist.FirstName} {artwork.Artist.LastName}" : "Unknown Artist",
              artwork.Medium,
              artwork.HeightCM,
              artwork.WidthCM,
              artwork.AcquisitionCost,
              artwork.AcquisitionDate,
              artwork.CreationDateDisplay,
              artwork.ProvenanceText,
              artwork.Status,
              artwork.Frame,
              artwork.LotNumber,
              Edition = artwork.Edition != null ? new {
                  artwork.Edition.EditionType,
                  artwork.Edition.Marking,
                  artwork.Edition.EstimatedValueRelative,
                  artwork.Edition.Rarity
              } : null,
              ArtworkImages = (artwork.ArtworkImages ?? new List<ArtworkImage>())
                  .Select(i => new { Id = i.ImageId, i.BlobUrl, i.IsPrimary })
                  .ToList(),
              // FIXED: Map single SubGroup Collection to list
              Collections = artwork.SubGroup != null && artwork.SubGroup.Collection != null
                  ? new List<string> { artwork.SubGroup.Collection.Name }
                  : new List<string>()
            });
          } catch (Exception ex)
          {
            return StatusCode(500, new { message = $"Error retrieving artwork {id}.", details = ex.Message, stackTrace = ex.ToString() });
          }
        }

        [HttpPost]
        public async Task<ActionResult<Artwork>> PostArtwork(ArtworkCreateDto artworkDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            if (!string.IsNullOrEmpty(artworkDto.EditionType) || !string.IsNullOrEmpty(artworkDto.EditionMarking))
            {
                var edition = new Edition
                {
                    EditionType = artworkDto.EditionType,
                    Marking = artworkDto.EditionMarking,
                    Rarity = artworkDto.EditionRarity,
                    EstimatedValueRelative = artworkDto.EditionValue
                };
                _context.Add(edition);
                await _context.SaveChangesAsync();
                artworkDto.EditionId = edition.EditionId;
            }

            var artwork = new Artwork
            {
                Title = artworkDto.Title,
                ArtistId = artworkDto.ArtistId,
                Medium = artworkDto.Medium,
                HeightCM = artworkDto.HeightCM,
                WidthCM = artworkDto.WidthCM,
                DepthCM = artworkDto.DepthCM,
                WeightKG = artworkDto.WeightKG,
                CreationDateDisplay = artworkDto.CreationDateDisplay,
                ProvenanceText = artworkDto.ProvenanceText,
                AcquisitionCost = artworkDto.AcquisitionCost,
                Frame = artworkDto.Frame,
                LotNumber = artworkDto.LotNumber,
                EditionId = artworkDto.EditionId,
                CreatedByProfileId = profileId,
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow
                // Note: SubGroup is not set on creation yet, user must add it to a collection/group later
            };

            _context.Artworks.Add(artwork);
            await _context.SaveChangesAsync();

            if (artworkDto.ImageUrls != null && artworkDto.ImageUrls.Count > 0)
            {
                for (int i = 0; i < artworkDto.ImageUrls.Count; i++)
                {
                    var imageUrl = artworkDto.ImageUrls[i];
                    var artworkImage = new ArtworkImage
                    {
                        ArtworkId = artwork.ArtworkId,
                        BlobUrl = imageUrl,
                        IsPrimary = (i == 0),
                        UploadedAt = DateTime.UtcNow
                    };
                    _context.ArtworkImages.Add(artworkImage);
                }
                await _context.SaveChangesAsync();
            }

            await _auditService.LogAsync("Artworks", artwork.ArtworkId, "INSERT", profileId, null, artwork);

            return CreatedAtAction(nameof(GetArtwork), new { id = artwork.ArtworkId }, artwork);
        }

        [HttpPost("{id}/images")]
        public async Task<IActionResult> AddArtworkImages(int id, [FromBody] List<string> imageUrls)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            var artwork = await _context.Artworks.FindAsync(id);
            if (artwork == null) return NotFound();

            if (artwork.CreatedByProfileId != profileId) return Forbid();

            if (imageUrls != null && imageUrls.Count > 0)
            {
                var newImages = new List<ArtworkImage>();
                var hasPrimary = await _context.ArtworkImages.AnyAsync(i => i.ArtworkId == id && i.IsPrimary == true);

                foreach (var url in imageUrls)
                {
                    var img = new ArtworkImage
                    {
                        ArtworkId = id,
                        BlobUrl = url,
                        IsPrimary = !hasPrimary,
                        UploadedAt = DateTime.UtcNow
                    };
                    _context.ArtworkImages.Add(img);
                    newImages.Add(img);
                    hasPrimary = true;
                }
                await _context.SaveChangesAsync();

                foreach (var img in newImages)
                {
                    await _auditService.LogAsync("ArtworkImages", img.ImageId, "INSERT", profileId, null, img);
                }
            }

            return Ok(new { message = "Images added successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutArtwork(int id, [FromBody] ArtworkUpdateDto artworkDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            if (id != artworkDto.ArtworkId && artworkDto.ArtworkId != 0)
            {
                return BadRequest("Artwork ID mismatch");
            }

            var artwork = await _context.Artworks.FindAsync(id);
            if (artwork == null)
            {
                return NotFound();
            }

            if (artwork.CreatedByProfileId != profileId)
            {
                return Forbid();
            }

            var oldState = new { artwork.CurrentLocationId, artwork.Medium, artwork.HeightCM, artwork.WidthCM, artwork.DepthCM, artwork.Frame, artwork.LotNumber, artwork.AcquisitionDate, artwork.ProvenanceText };

            artwork.CurrentLocationId = artworkDto.CurrentLocationId;
            artwork.Medium = artworkDto.Medium;
            artwork.HeightCM = artworkDto.HeightCM;
            artwork.WidthCM = artworkDto.WidthCM;
            artwork.DepthCM = artworkDto.DepthCM;
            artwork.Frame = artworkDto.Frame;
            artwork.LotNumber = artworkDto.LotNumber;
            artwork.AcquisitionDate = artworkDto.AcquisitionDate;
            artwork.ProvenanceText = artworkDto.ProvenanceText;
            artwork.LastModifiedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ArtworkExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            await _auditService.LogAsync("Artworks", id, "UPDATE", profileId, oldState, artworkDto);

            return NoContent();
        }

        private bool ArtworkExists(int id)
        {
            return _context.Artworks.Any(e => e.ArtworkId == id);
        }

        [HttpPost("update-valuation/{id}")]
        public async Task<IActionResult> UpdateValuation(int id, [FromBody] ValuationUpdateRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            var artwork = await _context.Artworks.FindAsync(id);

            if (artwork == null)
            {
                return NotFound(new { message = "Asset not found in UK Registry." });
            }

            var oldState = new { artwork.AcquisitionCost, artwork.AcquisitionDate, artwork.LastModifiedAt };

            artwork.AcquisitionCost = request.NewValuation;
            artwork.AcquisitionDate = request.EffectiveDate;
            artwork.LastModifiedAt = System.DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                await _auditService.LogAsync("Artworks", id, "UPDATE", profileId, oldState, new { artwork.AcquisitionCost, artwork.AcquisitionDate, artwork.LastModifiedAt });
                return Ok(new { message = "Asset valuation updated successfully." });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database error during valuation update.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtwork(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int profileId))
            {
                return Unauthorized(new { message = "Security Identity missing or invalid." });
            }

            var artwork = await _context.Artworks.FindAsync(id);
            if (artwork == null) return NotFound();

            var oldState = new { artwork.Title, artwork.ArtistId, artwork.AcquisitionCost };

            var artistId = artwork.ArtistId;

            _context.Artworks.Remove(artwork);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync("Artworks", id, "DELETE", profileId, oldState, null);

            if (artistId.HasValue)
            {
                var hasRemainingArtworks = await _context.Artworks.AnyAsync(a => a.ArtistId == artistId.Value);
                if (!hasRemainingArtworks)
                {
                    var artist = await _context.Set<Artist>().FindAsync(artistId.Value);
                    if (artist != null)
                    {
                        _context.Set<Artist>().Remove(artist);
                        await _context.SaveChangesAsync();
                    }
                }
            }

            return NoContent();
        }

        public class ValuationUpdateRequest
        {
            public decimal NewValuation { get; set; }
            public System.DateTime EffectiveDate { get; set; }
        }
    }

    public class ArtworkCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = null!;
        public int? ArtistId { get; set; }
        public string? Medium { get; set; }
        public decimal? HeightCM { get; set; }
        public decimal? WidthCM { get; set; }
        public decimal? DepthCM { get; set; }
        public decimal? WeightKG { get; set; }
        public string? CreationDateDisplay { get; set; }
        public string? ProvenanceText { get; set; }
        public decimal? AcquisitionCost { get; set; }
        public bool? Frame { get; set; }
        public string? LotNumber { get; set; }
        public int? EditionId { get; set; }
        public string? EditionType { get; set; }
        public string? EditionMarking { get; set; }
        public string? EditionRarity { get; set; }
        public string? EditionValue { get; set; }
        public List<string>? ImageUrls { get; set; }
    }

    public class ArtworkUpdateDto
    {
        public int ArtworkId { get; set; }
        public int? CurrentLocationId { get; set; }
        public string? Medium { get; set; }
        public decimal? HeightCM { get; set; }
        public decimal? WidthCM { get; set; }
        public decimal? DepthCM { get; set; }
        public bool? Frame { get; set; }
        public string? LotNumber { get; set; }
        public DateTime? AcquisitionDate { get; set; }
        public string? ProvenanceText { get; set; }
    }
}