using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FineArtApi.Data;
using FineArtApi.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using FineArtApi.Services;

namespace FineArtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CollectionsController : ControllerBase
    {
        private readonly ArtContext _context;
        private readonly IAuditService _auditService;

        public CollectionsController(ArtContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        // --- HELPERS ---
        private int? GetCurrentProfileId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id") ?? User.FindFirst("sub");
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            return null;
        }

        // GET: api/collections
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCollections()
        {
            var profileId = GetCurrentProfileId();
            if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

            var collections = await _context.Collections
                .Where(c => c.OwnerProfileId == profileId)
                .Include(c => c.SubGroups) // Eager load sub-groups to count items
                .Select(c => new {
                    c.CollectionId,
                    c.Name, // Updated from CollectionName
                    c.Description,
                    // Count all artworks across all subgroups in this collection
                    ArtworkCount = c.SubGroups.SelectMany(sg => sg.Artworks).Count(),
                    SubGroupCount = c.SubGroups.Count
                })
                .OrderByDescending(c => c.CollectionId) // Newest first
                .ToListAsync();

            return Ok(collections);
        }

        // GET: api/collections/5
        // Returns the hierarchy: Collection -> SubGroups -> Artworks (Summary)
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCollection(int id)
        {
            var profileId = GetCurrentProfileId();
            if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

            var collection = await _context.Collections
                .Include(c => c.SubGroups)
                .ThenInclude(sg => sg.Artworks)
                .ThenInclude(a => a.ArtworkImages) // Need image for thumbnail
                .Include(c => c.SubGroups)
                .ThenInclude(sg => sg.Artworks)
                .ThenInclude(a => a.Artist) // Need artist name
                .FirstOrDefaultAsync(c => c.CollectionId == id && c.OwnerProfileId == profileId);

            if (collection == null) return NotFound();

            // Transform to a clean shape for the UI
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
                        ArtistName = a.Artist != null ? $"{a.Artist.FirstName} {a.Artist.LastName}" : "Unknown",
                        // Get the Primary image, or the first one available
                        ImageUrl = a.ArtworkImages
                            .OrderByDescending(i => i.IsPrimary)
                            .Select(i => i.BlobUrl)
                            .FirstOrDefault()
                    }).ToList()
                }).ToList()
            };

            return Ok(result);
        }

        // POST: api/collections
        // Creates Collection AND Default SubGroup
        [HttpPost]
        public async Task<ActionResult<object>> CreateCollection([FromBody] CollectionCreateDto dto)
        {
            var profileId = GetCurrentProfileId();
            if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Create Collection
                var collection = new Collection
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    OwnerProfileId = profileId.Value,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Collections.Add(collection);
                await _context.SaveChangesAsync();

                // 2. Create Default SubGroup
                var defaultGroup = new SubGroup
                {
                    Name = "-",
                    Description = "Default Group",
                    CollectionId = collection.CollectionId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.SubGroups.Add(defaultGroup);
                await _context.SaveChangesAsync();

                // 3. Move requested artworks to the default group
                if (dto.ArtworkIds != null && dto.ArtworkIds.Any())
                {
                    var artworks = await _context.Artworks
                        .Where(a => dto.ArtworkIds.Contains(a.ArtworkId))
                        // Security: Ensure user owns these artworks or they are created by them
                        .Where(a => a.CreatedByProfileId == profileId) 
                        .ToListAsync();

                    foreach (var art in artworks)
                    {
                        art.SubGroupId = defaultGroup.SubGroupId;
                    }
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                await _auditService.LogAsync("Collections", collection.CollectionId, "INSERT", profileId.Value, null, new { collection.Name });

                return CreatedAtAction(nameof(GetCollection), new { id = collection.CollectionId }, new { collection.CollectionId, collection.Name });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // POST: api/collections/subgroup
        // Creates a new horizontal "Lane"
        [HttpPost("subgroup")]
        public async Task<ActionResult<object>> CreateSubGroup([FromBody] SubGroupCreateDto dto)
        {
            var profileId = GetCurrentProfileId();
            if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

            // Verify ownership of the parent collection
            var collection = await _context.Collections.FindAsync(dto.CollectionId);
            if (collection == null) return NotFound("Collection not found");
            if (collection.OwnerProfileId != profileId) return Forbid();

            var subGroup = new SubGroup
            {
                Name = dto.Name,
                Description = dto.Description,
                CollectionId = dto.CollectionId,
                CreatedAt = DateTime.UtcNow
            };

            _context.SubGroups.Add(subGroup);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync("SubGroups", subGroup.SubGroupId, "INSERT", profileId.Value, null, new { subGroup.Name });

            return Ok(new { subGroup.SubGroupId, subGroup.Name });
        }

        // DELETE: api/collections/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCollection(int id)
        {
            var profileId = GetCurrentProfileId();
            if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

            var collection = await _context.Collections.FindAsync(id);
            if (collection == null) return NotFound();
            if (collection.OwnerProfileId != profileId) return Forbid();

            // Snapshot for audit
            var auditState = new { collection.Name };

            // Cascade delete is handled by DB for SubGroups, but Artworks need to be unlinked (SetNull)
            // EF Core might handle SetNull automatically if configured, but let's be explicit if needed.
            // (The DB Constraint ON DELETE SET NULL handles the artworks, so we just remove the collection).

            _context.Collections.Remove(collection);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync("Collections", id, "DELETE", profileId.Value, auditState, null);

            return NoContent();
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

        // Optional list of artwork IDs to immediately move into the default group
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
}