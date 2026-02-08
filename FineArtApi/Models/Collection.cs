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
        public string Name { get; set; } = string.Empty; // Fixed: Was CollectionName

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int OwnerProfileId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // --- FIX: Added Missing Property ---
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        // --- NAVIGATION ---
        [JsonIgnore]
        public virtual UserProfile? OwnerProfile { get; set; }

        public virtual ICollection<SubGroup> SubGroups { get; set; } = new List<SubGroup>();
    }
}