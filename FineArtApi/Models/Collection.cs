using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FineArtApi.Models
{
    [Table("Collections", Schema = "dbo")]
    public class Collection
    {
        [Key]
        public int CollectionId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty; // Renamed from CollectionName to Name to match standard

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public int OwnerProfileId { get; set; }

        [ForeignKey("OwnerProfileId")]
        public virtual UserProfile? Owner { get; set; }

        // --- NEW NAVIGATION ---
        // Old: public virtual ICollection<CollectionArtwork> CollectionArtworks...
        // New: A collection has many sub-groups
        public virtual ICollection<SubGroup> SubGroups { get; set; } = new List<SubGroup>();
    }
}