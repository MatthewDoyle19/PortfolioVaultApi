using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// --- 1. THE BUILDER PHASE (Locking in the tools) ---

// This looks for the secret on Render. If it's not there (like on your Mac), 
// it uses your hardcoded string so you can still test locally.
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                       ?? "Host=ep-summer-king-alcbyjyd-pooler.c-3.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_PKj7ioea6XNE;SSL Mode=Require;Trust Server Certificate=true";

builder.Services.AddDbContext<VaultDb>(options => 
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// THIS IS THE BORDER. Do not put any builder.Services calls below this line.
var app = builder.Build();

// --- 2. THE APP PHASE (Using the tools) ---

app.UseDefaultFiles(); 
app.UseStaticFiles(); 
app.UseCors("AllowFrontend");

app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    const string secureKey = "2503";
    if (request.Key == secureKey)
    {
        return Results.Ok(new { success = true, message = "Access Granted" });
    }
    return Results.Json(new { success = false, message = "Invalid Key" }, statusCode: 401);
});

app.MapGet("/api/links", async (VaultDb db) => await db.Links.ToListAsync());

app.MapPost("/api/links", async (Link link, VaultDb db) => {
    db.Links.Add(link);
    await db.SaveChangesAsync();
    return Results.Created($"/api/links/{link.Id}", link);
});

app.MapDelete("/api/links/{id}", async (int id, VaultDb db) => {
    var link = await db.Links.FindAsync(id);
    if (link is null) return Results.NotFound();
    db.Links.Remove(link);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapGet("/api/commits", async (VaultDb db) => 
    await db.Commits.OrderByDescending(c => c.Date).ToListAsync());

app.MapPost("/api/commits", async (HttpRequest request, VaultDb db) => {
    var form = await request.ReadFormAsync();
    var date = form["date"].ToString();
    var message = form["message"].ToString();
    var file = form.Files.GetFile("image"); 

    string? imageUrl = null;

    if (file != null && file.Length > 0)
    {
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var fileBytes = memoryStream.ToArray();
        var base64String = Convert.ToBase64String(fileBytes);
        imageUrl = $"data:{file.ContentType};base64,{base64String}";
    }

    var commit = new Commit {
        Date = date,
        Message = message,
        ImageUrl = imageUrl
    };

    db.Commits.Add(commit);
    await db.SaveChangesAsync();
    return Results.Created($"/api/commits/{commit.Id}", commit);
});

app.MapDelete("/api/commits/{id}", async (int id, VaultDb db) => {
    var commit = await db.Commits.FindAsync(id);
    if (commit is null) return Results.NotFound();
    db.Commits.Remove(commit);
    await db.SaveChangesAsync();
    return Results.Ok();
});

using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<VaultDb>();
    db.Database.EnsureCreated();
    if (!db.Commits.Any()) {
        db.Commits.AddRange(
            new Commit { Date = "2026-03-24", Message = "Initial Commit: First Conversation." },
            new Commit { Date = "2026-04-20", Message = "Feature Added: Deep Transparency & Screen Share." },
            new Commit { Date = "2026-04-24", Message = "Patch 1.0: First Month Milestone Achieved." }
        );
        db.SaveChanges();
    }
}

app.Run();

// --- DATA MODELS ---
public class LoginRequest {
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;
}

class VaultDb : DbContext {
    public VaultDb(DbContextOptions<VaultDb> options) : base(options) { }
    public DbSet<Link> Links => Set<Link>();
    public DbSet<Commit> Commits => Set<Commit>();
}

class Link {
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
}

class Commit {
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; } 
}