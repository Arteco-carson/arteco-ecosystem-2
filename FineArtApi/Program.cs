using Microsoft.EntityFrameworkCore;
using FineArtApi.Data;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using FineArtApi.Services;

var builder = WebApplication.CreateBuilder(args);

// --- 1. AUTHENTICATION SERVICES (ISO27001 Compliance) ---
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (!builder.Environment.IsDevelopment())
    {
        if (string.IsNullOrEmpty(jwtKey) || jwtKey == "SuperSecretKeyForDevelopmentOnly12345!")
        {
            throw new InvalidOperationException("A strong JWT key must be configured for production environments.");
        }
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        // Ensure this matches AuthController SecretKey
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? "SuperSecretKeyForDevelopmentOnly12345!")),
        ValidateIssuer = false,
        ValidateAudience = false,
        //ClockSkew = TimeSpan.Zero 
    };

    // IT Operations Diagnostics: Log authentication failures for governance oversight
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("Governance/Auth Failure: " + context.Exception.Message);
            return Task.CompletedTask;
        }
    };
});

var frontendUrl = builder.Configuration["FrontendUrl"];
var allowedOrigins = new List<string>
{
    "https://agreeable-sky-071d8f90f.2.azurestaticapps.net",
    "https://calm-bay-0e5fc840f.6.azurestaticapps.net"
};

if (!string.IsNullOrEmpty(frontendUrl))
{
    allowedOrigins.Add(frontendUrl);
}
Console.WriteLine($"[Startup] CORS Configured for origins: {string.Join(", ", allowedOrigins)}");

builder.Services.AddCors(options => {
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                // For local development, allow any origin to support emulators and local web clients.
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
            else
            {
                // For production, create a strict policy that allows the web frontend and the mobile app.
                policy.SetIsOriginAllowed(origin =>
                {
                    // Allow the web frontend
                    if (!string.IsNullOrEmpty(origin) && allowedOrigins.Any(o => o.Equals(origin, StringComparison.OrdinalIgnoreCase)))
                    {
                        return true;
                    }

                    // Allow 'null' origin for the native mobile app
                    if (origin == null || origin.Equals("null", StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }

                    return false;
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            }
        });
});

// --- JSON CONFIGURATION (The Fix) ---
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        // FIX: Prevent 500 Errors due to Circular References (Collection -> SubGroup -> Collection)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// --- FIX: Robust Connection String Fallback ---
// If GetConnectionString returns empty (e.g. from empty appsettings.json), try other config locations
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = builder.Configuration["DefaultConnection"];
}
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection");
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("[Startup] CRITICAL: DefaultConnection string is missing or empty. Database operations will fail.");
}

builder.Services.AddDbContext<ArtContext>(options =>
    options.UseSqlServer(connectionString));

// Register the Audit Service
builder.Services.AddScoped<IAuditService, AuditService>();

// --- CHECK: Is BlobService missing? ---
// If your app uses images, ensure this line exists. If you removed it earlier, uncomment the line below:
// builder.Services.AddScoped<IBlobService, BlobService>(); 

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Always enable Swagger and SwaggerUI for API documentation and testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fine Art API V1");
});

if (app.Environment.IsDevelopment())
{
    // Development-specific configurations can go here
}

app.UseStaticFiles(); // Serve files from wwwroot
app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();