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
            try 
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                var collections = await _context.Collections
                    .Where(c => c.OwnerProfileId == profileId)
                    .Include(c => c.SubGroups) // <--- This will crash if SubGroups table or FK is missing
                    .Select(c => new {
                        c.CollectionId,
                        c.Name, 
                        c.Description,
                        ArtworkCount = c.SubGroups.SelectMany(sg => sg.Artworks).Count(), // <--- Crash if Artworks.SubGroupId is missing
                        SubGroupCount = c.SubGroups.Count
                    })
                    .OrderByDescending(c => c.CollectionId)
                    .ToListAsync();

                return Ok(collections);
            }
            catch (Exception ex)
            {
                // DEBUG: Return the actual DB error to the frontend
                return StatusCode(500, new { message = "Database Error", error = ex.Message, inner = ex.InnerException?.Message });
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
                            ArtistName = a.Artist != null ? $"{a.Artist.FirstName} {a.Artist.LastName}" : "Unknown",
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
                return StatusCode(500, new { message = "Database Error", error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        // POST: api/collections
        [HttpPost]
        public async Task<ActionResult<object>> CreateCollection([FromBody] CollectionCreateDto dto)
        {
            // Wrap in Try-Catch to see why it fails
            try 
            {
                var profileId = GetCurrentProfileId();
                if (profileId == null) return Unauthorized(new { message = "Identity invalid." });

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var collection = new Collection
                    {
                        Name = dto.Name,
                        Description = dto.Description,
                        OwnerProfileId = profileId.Value,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Collections.Add(collection);
                    await _context.SaveChangesAsync();

                    var defaultGroup = new SubGroup
                    {
                        Name = "-",
                        Description = "Default Group",
                        CollectionId = collection.CollectionId,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.SubGroups.Add(defaultGroup);
                    await _context.SaveChangesAsync();

                    if (dto.ArtworkIds != null && dto.ArtworkIds.Any())
                    {
                        var artworks = await _context.Artworks
                            .Where(a => dto.ArtworkIds.Contains(a.ArtworkId))
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
                    throw; // Re-throw to be caught by outer block
                }
            }
            catch (Exception ex)
            {
                // DEBUG: Return the actual error
                return StatusCode(500, new { message = "Create Failed", error = ex.Message, inner = ex.InnerException?.Message });
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
                    CreatedAt = DateTime.UtcNow
                };

                _context.SubGroups.Add(subGroup);
                await _context.SaveChangesAsync();

                await _auditService.LogAsync("SubGroups", subGroup.SubGroupId, "INSERT", profileId.Value, null, new { subGroup.Name });

                return Ok(new { subGroup.SubGroupId, subGroup.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Create Group Failed", error = ex.Message, inner = ex.InnerException?.Message });
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

                var auditState = new { collection.Name };

                _context.Collections.Remove(collection);
                await _context.SaveChangesAsync();

                await _auditService.LogAsync("Collections", id, "DELETE", profileId.Value, auditState, null);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Delete Failed", error = ex.Message, inner = ex.InnerException?.Message });
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
}