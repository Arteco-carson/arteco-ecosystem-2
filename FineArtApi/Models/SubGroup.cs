using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Required for JsonIgnore

namespace FineArtApi.Models
{
    [Table("SubGroups")]
    public class SubGroup
    {
        [Key]
        public int SubGroupId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int CollectionId { get; set; }

        [ForeignKey("CollectionId")]
        [JsonIgnore] // <--- STOPS THE INFINITE LOOP
        public virtual Collection? Collection { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation: A sub-group contains many artworks
        public virtual ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
    }
}