using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FineArtApi.Models
{
    [Table("ArtworkImages", Schema = "dbo")]
    public class ArtworkImage
    {
        [Key]
        public int ImageId { get; set; }

        [Required]
        public string BlobUrl { get; set; } = string.Empty;

        public string? ThumbnailUrl { get; set; }

        public bool IsPrimary { get; set; }

        public int? ArtworkId { get; set; }

        public DateTime? UploadedAt { get; set; } = DateTime.UtcNow;

        // --- FIX: Added LastModifiedAt (Required by Controller) ---
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        [ForeignKey("ArtworkId")]
        public virtual Artwork? Artwork { get; set; }
    }
}