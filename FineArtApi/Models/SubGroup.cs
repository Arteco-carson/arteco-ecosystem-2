using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FineArtApi.Models
{
    [Table("SubGroups", Schema = "dbo")]
    public class SubGroup
    {
        [Key]
        public int SubGroupId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty; // Fixed: Was SubGroupName

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int CollectionId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // --- FIX: Added Missing Property ---
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        // --- NAVIGATION ---
        [JsonIgnore] // Prevents upward loop
        public virtual Collection? Collection { get; set; }

        public virtual ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
    }
}