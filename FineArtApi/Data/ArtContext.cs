using Microsoft.EntityFrameworkCore;
using FineArtApi.Models;

namespace FineArtApi.Data
{
    public class ArtContext : DbContext
    {
        public ArtContext(DbContextOptions<ArtContext> options)
            : base(options)
        {
        }

        // --- TABLE REGISTRATIONS ---
        public DbSet<Artwork> Artworks { get; set; } = null!;
        public DbSet<ArtworkImage> ArtworkImages { get; set; } = null!;
        public DbSet<Artist> Artists { get; set; } = null!;
        public DbSet<Appraisal> Appraisals { get; set; } = null!;
        public DbSet<UserProfile> UserProfiles { get; set; } = null!;
        
        // --- COLLECTION MANAGER TABLES ---
        public DbSet<Collection> Collections { get; set; } = null!;
        public DbSet<SubGroup> SubGroups { get; set; } = null!; // NEW
        // REMOVED: public DbSet<CollectionArtwork> CollectionArtworks...
        
        public DbSet<Location> Locations { get; set; } = null!;
        public DbSet<UserLocation> UserLocations { get; set; } = null!;
        public DbSet<UserRole> UserRoles { get; set; } = null!;
        public DbSet<UserType> UserTypes { get; set; } = null!;
        public DbSet<UserSubType> UserSubTypes { get; set; } = null!;
        public DbSet<DefectReport> DefectReports { get; set; } = null!;
        public DbSet<DefectImage> DefectImages { get; set; } = null!;
        public DbSet<DefectConversation> DefectConversations { get; set; } = null!;
        public DbSet<Edition> Editions { get; set; } = null!;
        public DbSet<Currency> Currencies { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<Tenant> Tenants { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // PRESERVE: Financial precision for GBP
            modelBuilder.Entity<Artwork>()
                .Property(a => a.AcquisitionCost)
                .HasPrecision(19, 4); 

            modelBuilder.Entity<Appraisal>()
                .Property(a => a.ValuationAmount)
                .HasPrecision(19, 4);

            modelBuilder.Entity<Appraisal>()
                .Property(a => a.InsuranceValue)
                .HasPrecision(19, 4);

            // --- NEW: COLLECTION HIERARCHY ---
            // 1. Collection -> SubGroups (Cascade Delete)
            modelBuilder.Entity<SubGroup>()
                .HasOne(s => s.Collection)
                .WithMany(c => c.SubGroups)
                .HasForeignKey(s => s.CollectionId)
                .OnDelete(DeleteBehavior.Cascade);

            // 2. SubGroup -> Artworks (Set Null on Delete)
            modelBuilder.Entity<Artwork>()
                .HasOne(a => a.SubGroup)
                .WithMany(s => s.Artworks)
                .HasForeignKey(a => a.SubGroupId)
                .OnDelete(DeleteBehavior.SetNull);

            // 3. REMOVED: All CollectionArtwork (Many-to-Many) configurations

            // PRESERVE: Relationship between Artwork and Images
            modelBuilder.Entity<ArtworkImage>()
                .HasOne(img => img.Artwork)
                .WithMany(art => art.ArtworkImages)
                .HasForeignKey(img => img.ArtworkId)
                .OnDelete(DeleteBehavior.Cascade);

            // PRESERVE: Relationship between Artwork and Artist
            modelBuilder.Entity<Artwork>()
                .HasOne(a => a.Artist)
                .WithMany(art => art.Artworks)
                .HasForeignKey(a => a.ArtistId);

            // PRESERVE: Security/compliance unique username
            modelBuilder.Entity<UserProfile>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // EXPLICITLY DEFINE RELATIONSHIPS FOR UserProfile
            modelBuilder.Entity<UserProfile>()
                .HasOne(p => p.Role)
                .WithMany() 
                .HasForeignKey(p => p.RoleId)
                .IsRequired(); 

            modelBuilder.Entity<UserProfile>()
                .HasOne(p => p.UserType)
                .WithMany() 
                .HasForeignKey(p => p.UserTypeId)
                .IsRequired(false); 
        }
    }
}