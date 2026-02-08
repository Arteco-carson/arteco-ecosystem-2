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
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        // --- FIX: Changed to Nullable (int?) to match Database ---
        // This prevents the "500 Error" when reading existing data
        public int? OwnerProfileId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        // --- NAVIGATION ---
        [JsonIgnore]
        public virtual UserProfile? OwnerProfile { get; set; }

        public virtual ICollection<SubGroup> SubGroups { get; set; } = new List<SubGroup>();
    }
}