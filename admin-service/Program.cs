using admin_service.Clients;
using admin_service.Data;
using admin_service.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =========================================================
// REGISTER ADMIN DATABASE
// =========================================================

builder.Services.AddDbContext<AdminDbContext>(options =>
{
    var connectionString =
        builder.Configuration.GetConnectionString("AdminDatabase");

    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    );
});

// =========================================================
// REGISTER AUDIT SERVICE
// =========================================================

builder.Services.AddScoped<AuditService>();

// =========================================================
// ADD SERVICES TO THE CONTAINER
// =========================================================

builder.Services.AddControllers();

// =========================================================
// CONFIGURE CORS
// =========================================================
// Allow the React Admin Frontend to call the Admin Service
// from the browser.
//
// Admin Frontend:
// http://localhost:5173
//
// We also allow 5174 because the other SmartCart frontend
// may use that port during development.
// =========================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminFrontendPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =========================================================
// REGISTER AUTH CLIENT
// =========================================================

builder.Services.AddHttpClient<AuthClient>((serviceProvider, client) =>
{
    var configuration =
        serviceProvider.GetRequiredService<IConfiguration>();

    var baseUrl =
        configuration["Services:AuthService:BaseUrl"];

    client.BaseAddress = new Uri(baseUrl!);
});

// =========================================================
// REGISTER ORDER CLIENT
// =========================================================

builder.Services.AddHttpClient<OrderClient>((serviceProvider, client) =>
{
    var configuration =
        serviceProvider.GetRequiredService<IConfiguration>();

    var baseUrl =
        configuration["Services:OrderService:BaseUrl"];

    client.BaseAddress = new Uri(baseUrl!);
});

// =========================================================
// REGISTER PAYMENT CLIENT
// =========================================================

builder.Services.AddHttpClient<PaymentClient>((serviceProvider, client) =>
{
    var configuration =
        serviceProvider.GetRequiredService<IConfiguration>();

    var baseUrl =
        configuration["Services:PaymentService:BaseUrl"];

    client.BaseAddress = new Uri(baseUrl!);
});

// =========================================================
// REGISTER INVENTORY CLIENT
// =========================================================

builder.Services.AddHttpClient<InventoryClient>((serviceProvider, client) =>
{
    var configuration =
        serviceProvider.GetRequiredService<IConfiguration>();

    var baseUrl =
        configuration["Services:InventoryService:BaseUrl"];

    client.BaseAddress = new Uri(baseUrl!);
});

// =========================================================
// REGISTER PRODUCT CLIENT
// =========================================================

builder.Services.AddHttpClient<ProductClient>((serviceProvider, client) =>
{
    var configuration =
        serviceProvider.GetRequiredService<IConfiguration>();

    var baseUrl =
        configuration["Services:ProductService:BaseUrl"];

    client.BaseAddress = new Uri(baseUrl!);
});

// =========================================================
// REGISTER NOTIFICATION CLIENT
// =========================================================

builder.Services.AddHttpClient<NotificationClient>((serviceProvider, client) =>
{
    var configuration =
        serviceProvider.GetRequiredService<IConfiguration>();

    var baseUrl =
        configuration["Services:NotificationService:BaseUrl"];

    client.BaseAddress = new Uri(baseUrl!);
});

// =========================================================
// CONFIGURE JWT AUTHENTICATION
// =========================================================

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Prevent ASP.NET from automatically remapping
        // Spring Boot JWT claims.
        options.MapInboundClaims = false;

        // Read JWT secret from configuration.
        var secret =
            builder.Configuration["Jwt:Secret"];

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(secret!)
                    ),

                // Auth Service JWT does not use issuer.
                ValidateIssuer = false,

                // Auth Service JWT does not use audience.
                ValidateAudience = false,

                // Validate token expiration.
                ValidateLifetime = true,

                // No clock skew.
                ClockSkew = TimeSpan.Zero,

                // Auth Service stores role in "role" claim.
                RoleClaimType = "role"
            };
    });

// =========================================================
// SWAGGER / OPENAPI
// =========================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Enter your JWT token."
        });

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

// =========================================================
// BUILD APPLICATION
// =========================================================

var app = builder.Build();

// =========================================================
// HTTP REQUEST PIPELINE
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =========================================================
// CORS
// =========================================================
// Must run before Authentication/Authorization so that
// browser requests and preflight requests receive the
// appropriate CORS headers.
// =========================================================

app.UseCors("AdminFrontendPolicy");

// =========================================================
// HTTPS REDIRECTION
// =========================================================
// Disabled for the local HTTP development setup because
// the Admin Frontend currently calls:
// http://localhost:5191
//
// This prevents the browser's CORS preflight request from
// being redirected from HTTP to HTTPS.
// =========================================================

// app.UseHttpsRedirection();

// =========================================================
// AUTHENTICATION
// =========================================================
// Authentication must run before Authorization.
// =========================================================

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();