using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Required for JsonIgnore

namespace FineArtApi.Models
{
    [Table("Artists", Schema = "dbo")]
    public class Artist
    {
        [Key]
        [Column("ArtistId")]
        public int ArtistId { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        // --- RESTORED PROPERTY (Fixes Build Failure) ---
        [StringLength(100)]
        public string? Pseudonym { get; set; }

        [StringLength(100)]
        public string? Nationality { get; set; }

        public int? BirthYear { get; set; }
        public int? DeathYear { get; set; }

        public string? Biography { get; set; }
        public string? ProfileImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        // --- NAVIGATION PROPERTIES ---

        [JsonIgnore] // <--- PREVENTS INFINITE LOOPS
        public virtual ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
    }
}