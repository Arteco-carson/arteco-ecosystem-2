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

        // --- HELPER: Extracts the Deepest SQL Error ---
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
                        // Includes SubGroups so UI tiles appear
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

        // --- NEW: GET api/collections/subgroup/5 (Fixes 404 Error) ---
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
                
                // Security check: Ensure the user owns the collection this group belongs to
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
                         a.YearCreated,
                         a.Medium
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Get Group Failed", error = GetFullError(ex) });
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

                // 1. Create Collection
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

                // 2. Create Default SubGroup
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

                try 
                {
                    await _auditService.LogAsync("Collections", collection.CollectionId, "INSERT", profileId.Value, null, new { collection.Name });
                }
                catch (Exception auditEx)
                {
                    Console.WriteLine("Audit Log Failed: " + auditEx.Message);
                }

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
}