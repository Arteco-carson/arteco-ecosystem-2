namespace FineArtApi.Models
{
    public class UpdateProfileRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? TelephoneNumber { get; set; }
        public int UserTypeId { get; set; }
        public int? UserSubTypeId { get; set; }
    }
}
