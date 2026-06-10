using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.IO;
using System.Net.Http; // Required for Telegram

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

// --- 2. TELEGRAM SETTINGS (Push Notifications) ---
var httpClient = new HttpClient();

async Task SendTelegramNotification(string message)
{
    // التوكن والـ Chat ID الخاصين بك
    string botToken = "8899922136:AAEU5IWwZLw_LsdoWwkXywTd0FfVrSgPzSw"; 
    string chatId = "-5233134027"; 

    // لاحظ أننا أزلنا النص من الرابط
    string url = $"https://api.telegram.org/bot{botToken}/sendMessage";
    
    // تغليف الرسالة في صندوق JSON محمي
    var payload = System.Text.Json.JsonSerializer.Serialize(new {
        chat_id = chatId,
        text = message
    });
    
    var content = new StringContent(payload, System.Text.Encoding.UTF8, "application/json");

    try { 
        // إرسال الصندوق بطريقة POST الآمنة
        await httpClient.PostAsync(url, content); 
    } 
    catch (Exception ex) { 
        Console.WriteLine($"[TELEGRAM ERROR] {ex.Message}");
    }
}


// --- 3. THE APP PHASE ---
app.UseDefaultFiles(); 
app.UseStaticFiles(); 
app.UseCors("AllowFrontend");

// --- AUTH ---
app.MapPost("/api/auth/login", async (LoginRequest request) =>
{
    const string secureKey = "2503";
    if (request.Key == secureKey) {
        await SendTelegramNotification("🔓 Someone just unlocked the Vault!");
        return Results.Ok(new { success = true, message = "Access Granted" });
    }
    await SendTelegramNotification("⚠️ Failed attempt to access the Vault with an incorrect password!");
    return Results.Json(new { success = false, message = "Invalid Key" }, statusCode: 401);
});

// --- LINKS ---
app.MapGet("/api/links", async (VaultDb db) => await db.Links.ToListAsync());

app.MapPost("/api/links", async (Link link, VaultDb db) => {
    db.Links.Add(link);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"🔗 A new link has been saved!\nTitle: {link.Title}");
    
    return Results.Created($"/api/links/{link.Id}", link);
});

app.MapDelete("/api/links/{id}", async (int id, VaultDb db) => {
    var link = await db.Links.FindAsync(id);
    if (link is null) return Results.NotFound();
    db.Links.Remove(link);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"🗑️ A link was deleted from the Vault!\nTitle: {link.Title}");
    
    return Results.Ok();
});

// --- COMMITS (MEMORIES) ---
app.MapGet("/api/commits", async (VaultDb db) => 
    await db.Commits.OrderByDescending(c => c.Date).ToListAsync());

app.MapPost("/api/commits", async (Commit commit, VaultDb db) => {
    db.Commits.Add(commit);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"📸 A new memory has been added!\n\nDescription: {commit.Message}");
    
    return Results.Created($"/api/commits/{commit.Id}", commit);
});

app.MapDelete("/api/commits/{id}", async (int id, VaultDb db) => {
    var commit = await db.Commits.FindAsync(id);
    if (commit is null) return Results.NotFound();
    db.Commits.Remove(commit);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"🗑️ A memory was unfortunately deleted!\nLost description: {commit.Message}");
    
    return Results.Ok();
});

// --- PENALTIES (Digital Court) ---
app.MapGet("/api/penalties", async (VaultDb db) => 
    await db.Penalties.OrderByDescending(p => p.Id).ToListAsync());

app.MapPost("/api/penalties", async (Penalty penalty, VaultDb db) => {
    db.Penalties.Add(penalty);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"⚖️ Digital Court: A new verdict has been issued!\n\nJudge: {penalty.Punisher}\nPunished: {penalty.Punished}\n\nVerdict:\n{penalty.PenaltyText}");
    
    return Results.Created($"/api/penalties/{penalty.Id}", penalty);
});

app.MapDelete("/api/penalties/{id}", async (int id, VaultDb db) => {
    var penalty = await db.Penalties.FindAsync(id);
    if (penalty is null) return Results.NotFound();
    db.Penalties.Remove(penalty);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"🗑️ A verdict was deleted/canceled from the ledger!\nThe punished was: {penalty.Punished}");
    
    return Results.Ok();
});

// --- MOOD RADAR ---
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
    
    string alertEmoji = newMood.Status == "SOS" ? "🚨 EMERGENCY!" : "📡 Mood Update:";
    await SendTelegramNotification($"{alertEmoji}\n{newMood.User} updated their status to ({newMood.Status})\nat {newMood.UpdatedAt}");
    
    return Results.Ok(newMood);
});

// --- EVENTS (CALENDAR) ---
app.MapGet("/api/events", async (VaultDb db) => 
    await db.Events.OrderBy(e => e.Date).ToListAsync());

app.MapPost("/api/events", async (Event ev, VaultDb db) => {
    db.Events.Add(ev);
    await db.SaveChangesAsync();
    return Results.Created($"/api/events/{ev.Id}", ev);
});

app.MapDelete("/api/events/{id}", async (int id, VaultDb db) => {
    var ev = await db.Events.FindAsync(id);
    if (ev is null) return Results.NotFound();
    db.Events.Remove(ev);
    await db.SaveChangesAsync();
    return Results.Ok();
});

// --- HEARTBEAT (PING) ---
app.MapGet("/api/heartbeats/latest", async (VaultDb db) => 
    await db.Heartbeats.OrderByDescending(h => h.Id).FirstOrDefaultAsync());

app.MapPost("/api/heartbeats", async (Heartbeat hb, VaultDb db) => {
    db.Heartbeats.Add(hb);
    await db.SaveChangesAsync();
    
    // 🚀 إشعار النبضة
    string target = hb.Sender == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";
    await SendTelegramNotification($"✨ {hb.Sender} is thinking of {target} right now and sent a Spark! 🤍");
    
    return Results.Ok(hb);
});

// --- BUCKET LIST (The New Feature) ---
app.MapGet("/api/bucketlist", async (VaultDb db) => 
    await db.BucketListItems.OrderBy(b => b.IsCompleted).ThenByDescending(b => b.Id).ToListAsync());

app.MapPost("/api/bucketlist", async (BucketListItem item, VaultDb db) => {
    db.BucketListItems.Add(item);
    await db.SaveChangesAsync();
    
    await SendTelegramNotification($"🗺️ A new goal/place was added to the Bucket List!\nGoal: {item.Title}");
    
    return Results.Created($"/api/bucketlist/{item.Id}", item);
});

app.MapPut("/api/bucketlist/{id}", async (int id, VaultDb db) => {
    var item = await db.BucketListItems.FindAsync(id);
    if (item is null) return Results.NotFound();
    
    item.IsCompleted = !item.IsCompleted; 
    await db.SaveChangesAsync();
    
    string status = item.IsCompleted ? "✅ Completed!" : "❌ Reverted";
    await SendTelegramNotification($"🗺️ Bucket List Update:\nGoal: {item.Title}\nStatus: {status}");
    
    return Results.Ok(item);
});

app.MapDelete("/api/bucketlist/{id}", async (int id, VaultDb db) => {
    var item = await db.BucketListItems.FindAsync(id);
    if (item is null) return Results.NotFound();
    db.BucketListItems.Remove(item);
    await db.SaveChangesAsync();
    return Results.Ok();
});

// --- ✈️ VISIT ITINERARY (RELATIONAL) ---
app.MapGet("/api/visit/dates", async (VaultDb db) => 
    await db.VisitDates.OrderByDescending(d => d.Id).FirstOrDefaultAsync()); // Get the latest active trip

app.MapPost("/api/visit/dates", async (VisitDates dates, VaultDb db) => {
    db.VisitDates.Add(dates); // Always create a new trip instance
    await db.SaveChangesAsync();
    await SendTelegramNotification($"✈️ New Trip Planned: From {dates.StartDate} to {dates.EndDate}! 🤍");
    return Results.Ok(dates); // Returns the newly created ID to the frontend
});

// Fetch tasks ONLY for the active trip range
app.MapGet("/api/visit/tasks/{visitDatesId}", async (int visitDatesId, VaultDb db) => 
    await db.VisitTasks.Where(t => t.VisitDatesId == visitDatesId).OrderBy(t => t.IsCompleted).ThenBy(t => t.Id).ToListAsync());

app.MapPost("/api/visit/tasks", async (VisitTask task, VaultDb db) => {
    db.VisitTasks.Add(task);
    await db.SaveChangesAsync();
    await SendTelegramNotification($"📌 New task added for this trip: {task.Title}");
    return Results.Created($"/api/visit/tasks/{task.Id}", task);
});

app.MapPut("/api/visit/tasks/{id}", async (int id, VaultDb db) => {
    var task = await db.VisitTasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    
    task.IsCompleted = !task.IsCompleted;
    task.CompletedAt = task.IsCompleted ? DateTime.Now.ToString("dd MMM, hh:mm tt") : null;
    
    await db.SaveChangesAsync();
    return Results.Ok(task);
});

app.MapDelete("/api/visit/tasks/{id}", async (int id, VaultDb db) => {
    var task = await db.VisitTasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    db.VisitTasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.Ok();
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
    public DbSet<Mood> Moods => Set<Mood>(); 
    public DbSet<Event> Events => Set<Event>(); 
    public DbSet<Heartbeat> Heartbeats => Set<Heartbeat>();
    public DbSet<BucketListItem> BucketListItems => Set<BucketListItem>();
    public DbSet<VisitDates> VisitDates => Set<VisitDates>();
    public DbSet<VisitTask> VisitTasks => Set<VisitTask>();
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
    [JsonPropertyName("unlockDate")] public string? UnlockDate { get; set; }
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

class Event {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("date")] public string Date { get; set; } = string.Empty; 
    [JsonPropertyName("type")] public string Type { get; set; } = "Task"; 
}

class Heartbeat {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("sender")] public string Sender { get; set; } = string.Empty;
}

// 🗺️ The New Bucket List Data Model
class BucketListItem {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("isCompleted")] public bool IsCompleted { get; set; } = false;
}

class VisitDates {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("startDate")] public string StartDate { get; set; } = string.Empty;
    [JsonPropertyName("endDate")] public string EndDate { get; set; } = string.Empty;
}

class VisitTask {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("isCompleted")] public bool IsCompleted { get; set; } = false;
    [JsonPropertyName("completedAt")] public string? CompletedAt { get; set; }
    
    // 🔗 Foreign Key linking to the specific date range instance
    [JsonPropertyName("visitDatesId")] public int VisitDatesId { get; set; }
}