using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FineArtApi.Models
{
    [Table("UserSubTypes")]
    public class UserSubType
    {
        [Key]
        public int SubTypeId { get; set; }

        public int UserTypeId { get; set; }

        [Required]
        [StringLength(100)]
        public string SubTypeName { get; set; } = string.Empty;
    }
}
