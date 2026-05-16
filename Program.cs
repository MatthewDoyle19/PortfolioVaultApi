using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.IO;
using System.Net.Http; // ضروري للاتصال بتليجرام

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

// --- 2. إعدادات تليجرام (Telegram Push Notifications) ---
var httpClient = new HttpClient();

async Task SendTelegramNotification(string message)
{
    // التوكن والـ Chat ID الخاصين بك
    string botToken = "8899922136:AAEU5IWwZLw_LsdoWwkXywTd0FfVrSgPzSw"; 
    string chatId = "-5233134027"; 

    // تحويل النص ليكون متوافقاً مع الروابط (لتجنب مشاكل اللغة العربية)
    string url = $"https://api.telegram.org/bot{botToken}/sendMessage?chat_id={chatId}&text={Uri.EscapeDataString(message)}";
    
    try { 
        await httpClient.GetAsync(url); 
    } 
    catch { 
        // نتجاهل الأخطاء هنا لكي لا ينهار السيرفر إذا انقطع الإنترنت
    }
}


// --- 3. THE APP PHASE ---
app.UseDefaultFiles(); 
app.UseStaticFiles(); 
app.UseCors("AllowFrontend");

// --- AUTH ---
// --- AUTH ---
app.MapPost("/api/auth/login", async (LoginRequest request) =>
{
    const string secureKey = "2503";
    if (request.Key == secureKey) {
        // اختياري: إشعار عند دخول أي شخص للخزنة (يمكنك حذفه إذا كان مزعجاً)
        await SendTelegramNotification("🔓 شخص ما قام بفتح الخزنة الآن!");
        return Results.Ok(new { success = true, message = "Access Granted" });
    }
    await SendTelegramNotification("⚠️ محاولة دخول فاشلة للخزنة بكلمة مرور خاطئة!");
    return Results.Json(new { success = false, message = "Invalid Key" }, statusCode: 401);
});

// --- LINKS ---
app.MapGet("/api/links", async (VaultDb db) => await db.Links.ToListAsync());

app.MapPost("/api/links", async (Link link, VaultDb db) => {
    db.Links.Add(link);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار إضافة رابط
    await SendTelegramNotification($"🔗 تم حفظ رابط جديد!\nالعنوان: {link.Title}");
    
    return Results.Created($"/api/links/{link.Id}", link);
});

app.MapDelete("/api/links/{id}", async (int id, VaultDb db) => {
    var link = await db.Links.FindAsync(id);
    if (link is null) return Results.NotFound();
    db.Links.Remove(link);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار حذف رابط
    await SendTelegramNotification($"🗑️ تم حذف رابط من الخزنة!\nالعنوان: {link.Title}");
    
    return Results.Ok();
});

// --- COMMITS (MEMORIES) ---
app.MapGet("/api/commits", async (VaultDb db) => 
    await db.Commits.OrderByDescending(c => c.Date).ToListAsync());

app.MapPost("/api/commits", async (Commit commit, VaultDb db) => {
    db.Commits.Add(commit);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار إضافة ذكرى
    await SendTelegramNotification($"📸 تم إضافة ذكرى جديدة!\n\nالوصف: {commit.Message}");
    
    return Results.Created($"/api/commits/{commit.Id}", commit);
});

app.MapDelete("/api/commits/{id}", async (int id, VaultDb db) => {
    var commit = await db.Commits.FindAsync(id);
    if (commit is null) return Results.NotFound();
    db.Commits.Remove(commit);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار حذف ذكرى
    await SendTelegramNotification($"🗑️ تم حذف ذكرى للأسف!\nالوصف المفقود: {commit.Message}");
    
    return Results.Ok();
});

// --- PENALTIES (محكمة القلوب) ---
app.MapGet("/api/penalties", async (VaultDb db) => 
    await db.Penalties.OrderByDescending(p => p.Id).ToListAsync());

app.MapPost("/api/penalties", async (Penalty penalty, VaultDb db) => {
    db.Penalties.Add(penalty);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار إضافة حكم
    await SendTelegramNotification($"⚖️ محكمة القلوب: تم إصدار حكم جديد!\n\nالقاضي: {penalty.Punisher}\nالمُعاقب: {penalty.Punished}\n\nنص الحكم:\n{penalty.PenaltyText}");
    
    return Results.Created($"/api/penalties/{penalty.Id}", penalty);
});

app.MapDelete("/api/penalties/{id}", async (int id, VaultDb db) => {
    var penalty = await db.Penalties.FindAsync(id);
    if (penalty is null) return Results.NotFound();
    db.Penalties.Remove(penalty);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار حذف حكم
    await SendTelegramNotification($"🗑️ تم إلغاء/حذف حكم من السجل!\nالمُعاقب كان: {penalty.Punished}");
    
    return Results.Ok();
});

// --- MOOD RADAR (رادار المزاج) ---
app.MapGet("/api/moods", async (VaultDb db) => await db.Moods.ToListAsync());

app.MapPost("/api/moods", async (Mood newMood, VaultDb db) => {
    var existing = await db.Moods.FirstOrDefaultAsync(m => m.User == newMood.User);
    if (existing != null) {
        existing.Status = newMood.Status;
        existing.UpdatedAt = newMood.UpdatedAt;
    } else {
        db.Moods.Add(newMood);
    }
    await db.SaveChangesAsync();
    
    // 🚀 إشعار تغيير المزاج
    string alertEmoji = newMood.Status == "SOS" ? "🚨 طوارئ!" : "📡 تحديث مزاج:";
    await SendTelegramNotification($"{alertEmoji}\nقام/ت {newMood.User} بتحديث الحالة إلى ({newMood.Status})\nفي الساعة {newMood.UpdatedAt}");
    
    return Results.Ok(newMood);
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
    public DbSet<Mood> Moods => Set<Mood>(); // تم إضافة جدول المزاج
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
    [JsonPropertyName("date")] public string Date { get; set; } = string.Empty;
    [JsonPropertyName("punisher")] public string Punisher { get; set; } = string.Empty;
    [JsonPropertyName("punished")] public string Punished { get; set; } = string.Empty;
    [JsonPropertyName("penaltyText")] public string PenaltyText { get; set; } = string.Empty;
    [JsonPropertyName("isCompleted")] public bool IsCompleted { get; set; } = false;
}

class Mood {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("user")] public string User { get; set; } = string.Empty;
    [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
    [JsonPropertyName("updatedAt")] public string UpdatedAt { get; set; } = string.Empty;
}