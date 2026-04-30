using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- 1. THE BUILDER PHASE ---
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                       ?? "Host=ep-summer-king-alcbyjyd-pooler.c-3.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_PKj7ioea6XNE;SSL Mode=Require;Trust Server Certificate=true";

builder.Services.AddDbContext<VaultDb>(options => options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// --- 2. THE APP PHASE ---
app.UseDefaultFiles(); 
app.UseStaticFiles(); 
app.UseCors("AllowFrontend");

// --- AUTH ---
app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    const string secureKey = "2503";
    return request.Key == secureKey 
        ? Results.Ok(new { success = true, message = "Access Granted" }) 
        : Results.Json(new { success = false, message = "Invalid Key" }, statusCode: 401);
});

// --- LINKS ---
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

// --- COMMITS (MEMORIES) ---
app.MapGet("/api/commits", async (VaultDb db) => 
    await db.Commits.OrderByDescending(c => c.Date).ToListAsync());

app.MapPost("/api/commits", async (Commit commit, VaultDb db) => {
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

// --- PENALTIES (THE LEDGER) ---
// جلب الأحكام مرتبة من الأحدث إلى الأقدم
app.MapGet("/api/penalties", async (VaultDb db) => 
    await db.Penalties.OrderByDescending(p => p.Id).ToListAsync());

// إضافة حكم جديد للسجل
app.MapPost("/api/penalties", async (Penalty penalty, VaultDb db) => {
    db.Penalties.Add(penalty);
    await db.SaveChangesAsync();
    return Results.Created($"/api/penalties/{penalty.Id}", penalty);
});

// حذف حكم من السجل
app.MapDelete("/api/penalties/{id}", async (int id, VaultDb db) => {
    var penalty = await db.Penalties.FindAsync(id);
    if (penalty is null) return Results.NotFound();
    db.Penalties.Remove(penalty);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapPut("/api/penalties/{id}/complete", async (int id, VaultDb db) => {
    var penalty = await db.Penalties.FindAsync(id);
    if (penalty is null) return Results.NotFound();
    penalty.IsCompleted = true;
    await db.SaveChangesAsync();
    return Results.Ok(penalty);
});

// --- DB SEEDING ---
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<VaultDb>();
    db.Database.EnsureCreated();
}

app.Run();

// --- DATA MODELS ---
public class LoginRequest {
    [JsonPropertyName("key")] public string Key { get; set; } = string.Empty;
}

class VaultDb : DbContext {
    public VaultDb(DbContextOptions<VaultDb> options) : base(options) { }
    public DbSet<Link> Links => Set<Link>();
    public DbSet<Commit> Commits => Set<Commit>();
    public DbSet<Penalty> Penalties => Set<Penalty>();
}

class Link {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
}

class Commit {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("date")] public string Date { get; set; } = string.Empty;
    [JsonPropertyName("message")] public string Message { get; set; } = string.Empty;
    [JsonPropertyName("imageUrl")] public string? ImageUrl { get; set; } 
    [JsonPropertyName("audioUrl")] public string? AudioUrl { get; set; }
}

class Penalty {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("date")] public string Date { get; set; } = string.Empty; // سيخزن الوقت والتاريخ
    [JsonPropertyName("punisher")] public string Punisher { get; set; } = string.Empty; // القاضي
    [JsonPropertyName("punished")] public string Punished { get; set; } = string.Empty; // المتهم
    [JsonPropertyName("penaltyText")] public string PenaltyText { get; set; } = string.Empty; // نص الحكم
    [JsonPropertyName("isCompleted")] public bool IsCompleted { get; set; } = false;
}