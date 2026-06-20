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
    string botToken = "8899922136:AAEU5IWwZLw_LsdoWwkXywTd0FfVrSgPzSw"; 
    string chatId = "-5233134027"; 

    string url = $"https://api.telegram.org/bot{botToken}/sendMessage";

    var payload = System.Text.Json.JsonSerializer.Serialize(new {
        chat_id = chatId,
        text = message
    });

    var content = new StringContent(payload, System.Text.Encoding.UTF8, "application/json");

    try { 
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

    // UI Transform for Telegram
    string displayPunisher = penalty.Punisher == "Mohammad" ? "7amodee" : (penalty.Punisher == "Zainab" ? "ZoZo" : penalty.Punisher);
    string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);

    await SendTelegramNotification($"⚖️ Digital Court: A new verdict has been issued!\n\nJudge: {displayPunisher}\nPunished: {displayPunished}\n\nVerdict:\n{penalty.PenaltyText}");

    return Results.Created($"/api/penalties/{penalty.Id}", penalty);
});

app.MapDelete("/api/penalties/{id}", async (int id, VaultDb db) => {
    var penalty = await db.Penalties.FindAsync(id);
    if (penalty is null) return Results.NotFound();
    db.Penalties.Remove(penalty);
    await db.SaveChangesAsync();

    string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);
    await SendTelegramNotification($"🗑️ A verdict was deleted/canceled from the ledger!\nThe punished was: {displayPunished}");

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
    string displayUser = newMood.User == "Mohammad" ? "7amodee" : (newMood.User == "Zainab" ? "ZoZo" : newMood.User);

    await SendTelegramNotification($"{alertEmoji}\n{displayUser} updated their status to ({newMood.Status})\nat {newMood.UpdatedAt}");

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

    string displaySender = hb.Sender == "Mohammad" ? "7amodee" : (hb.Sender == "Zainab" ? "ZoZo" : hb.Sender);
    string target = hb.Sender == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";
    await SendTelegramNotification($"✨ {displaySender} is thinking of {target} right now and sent a Spark! 🤍");

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

// --- ✈️ VISIT ITINERARY (RELATIONAL & GROUPED) ---
app.MapGet("/api/visit/all", async (VaultDb db) => {
    var dates = await db.VisitDates.OrderByDescending(d => d.Id).ToListAsync();
    var tasks = await db.VisitTasks.ToListAsync();

    var result = dates.Select(d => new {
        Id = d.Id,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        Tasks = tasks.Where(t => t.VisitDatesId == d.Id).OrderBy(t => t.IsCompleted).ThenBy(t => t.Id).ToList()
    });

    return Results.Ok(result);
});

app.MapPost("/api/visit/dates", async (VisitDates dates, VaultDb db) => {
    db.VisitDates.Add(dates); 
    await db.SaveChangesAsync();
    await SendTelegramNotification($"✈️ New Trip Planned: From {dates.StartDate} to {dates.EndDate}! 🤍");
    return Results.Ok(dates); 
});

app.MapPost("/api/visit/tasks", async (VisitTask task, VaultDb db) => {
    db.VisitTasks.Add(task);
    await db.SaveChangesAsync();
    await SendTelegramNotification($"📌 New task added for this trip: {task.Title}");
    return Results.Created($"/api/visit/tasks/{task.Id}", task);
});

app.MapPut("/api/visit/tasks/{id}", async (int id, TaskToggleRequest req, VaultDb db) => {
    var task = await db.VisitTasks.FindAsync(id);
    if (task is null) return Results.NotFound();

    task.IsCompleted = !task.IsCompleted;
    task.CompletedAt = task.IsCompleted ? req.LocalTime : null; 

    await db.SaveChangesAsync();

    string status = task.IsCompleted ? $"✅ Done at {task.CompletedAt}" : "❌ Reverted";
    await SendTelegramNotification($"📌 Visit Update:\nPlan: {task.Title}\nStatus: {status}");

    return Results.Ok(task);
});

app.MapDelete("/api/visit/tasks/{id}", async (int id, VaultDb db) => {
    var task = await db.VisitTasks.FindAsync(id);
    if (task is null) return Results.NotFound();
    db.VisitTasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapDelete("/api/visit/dates/{id}", async (int id, VaultDb db) => {
    var trip = await db.VisitDates.FindAsync(id);
    if (trip is null) return Results.NotFound();

    db.VisitDates.Remove(trip);
    await db.SaveChangesAsync();

    await SendTelegramNotification($"🗑️ An entire trip container ({trip.StartDate} to {trip.EndDate}) was deleted from the Vault!");

    return Results.Ok();
});

// --- 🚨 LIVE SOS PROTOCOL ---
app.MapPost("/api/sos", async (SosRequest req, VaultDb db) => {
    var existingMood = await db.Moods.FirstOrDefaultAsync(m => m.User == req.User);
    if (existingMood != null) {
        existingMood.Status = "SOS";
        existingMood.UpdatedAt = DateTime.Now.ToString("hh:mm tt");
    } else {
        db.Moods.Add(new Mood { User = req.User, Status = "SOS", UpdatedAt = DateTime.Now.ToString("hh:mm tt") });
    }
    await db.SaveChangesAsync();

    string mapLink = (req.Lat.HasValue && req.Lng.HasValue)
        ? $"\n📍 Live Location: https://www.google.com/maps?q={req.Lat},{req.Lng}"
        : "\n📍 Location: (Location services were denied/disabled by device)";

    string displayUser = req.User == "Mohammad" ? "7amodee" : (req.User == "Zainab" ? "ZoZo" : req.User);
    string target = req.User == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";

    await SendTelegramNotification($"🚨 EMERGENCY SOS TRIGGERED 🚨\n\n{displayUser} has pressed the panic button and needs {target} ASAP!{mapLink}");

    return Results.Ok();
});

// --- 💭 THE DUAL-LOCK BLIND PROMPT ---
app.MapGet("/api/prompts/history", async (VaultDb db) => {
    // نجلب فقط الأسئلة التي كُسر قفلها (كلاكما أجاب عليها)
    return await db.BlindPrompts
        .Where(p => p.MohammadAnswer != null && p.ZainabAnswer != null)
        .OrderByDescending(p => p.Id)
        .ToListAsync();
});

app.MapGet("/api/prompts/current", async (VaultDb db) => {
    return await db.BlindPrompts.OrderByDescending(p => p.Id).FirstOrDefaultAsync();
});

var deepQuestions = new List<string> {
    "What is a memory of us you secretly replay in your mind? ✨",
    "What was the exact moment you realized we were going to be close? 🦋",
    "Which of our inside jokes is your absolute favorite? 😂",
    "If you could relive one single day we spent together, which one would it be? ⏪",
    "What is something small I did this week that made you smile? 🤍",
    "When did you feel the most loved by me recently? 🥰",
    "What is a personality trait of mine that you admire the most? 🌟",
    "What is the most comforting thing I do when you are stressed or tired? 🔋",
    "When was the last time I made you feel truly proud? 🦅",
    "What is a weird habit of mine that you actually like? 🫣",
    "What is a fear or insecurity you have that you think I can help you overcome? 🛡️",
    "How do you think you have changed for the better since we started talking? 🌱",
    "What is something you’ve always wanted to tell me but haven't found the right moment? 🗝️",
    "If you could read my mind for one minute, what do you think you would hear? 🧠",
    "What does 'feeling safe' mean to you in our relationship? 🏰",
    "Where do you see us in exactly one year from today? 🎯",
    "What is a new hobby or skill you want us to learn together? 🎨",
    "How can I be a better support system for you in this current season of your life? 🤝",
    "If we had an unlimited budget for one weekend, what is the first trip we would take? ✈️",
    "If I came with a warning label, what exactly would it say? ⚠️",
    "What movie or TV show dynamic reminds you the most of us? 🍿",
    "If we had to survive a zombie apocalypse together, what would be our roles? 🧟‍♂️"
};

app.MapPost("/api/prompts/generate", async (VaultDb db) => {
    // 🧹 1. تنظيف عميق: مسح أي أسئلة سابقة لم يتم الإجابة عليها لتجنب التراكم
    var unfinished = await db.BlindPrompts
        .Where(p => p.MohammadAnswer == null || p.ZainabAnswer == null)
        .ToListAsync();

    if (unfinished.Any()) {
        db.BlindPrompts.RemoveRange(unfinished);
    }

    // 2. توليد السؤال الجديد النظيف
    var q = deepQuestions[new Random().Next(deepQuestions.Count)];
    var prompt = new BlindPrompt { Question = q, DateAdded = DateTime.Now.ToString("dd MMM yyyy") };
    db.BlindPrompts.Add(prompt);

    await db.SaveChangesAsync(); // نحفظ التغييرات (الحذف والإضافة) بضربة واحدة

    await SendTelegramNotification($"💭 A new Blind Prompt has dropped in The Vault!\nGo answer it before the other does! 🔒");
    return Results.Ok(prompt);
});

app.MapPut("/api/prompts/{id}/answer", async (int id, AnswerRequest req, VaultDb db) => {
    var prompt = await db.BlindPrompts.FindAsync(id);
    if (prompt == null) return Results.NotFound();

    // تسجيل إجابة الطرف الحالي
    if (req.User == "Mohammad") prompt.MohammadAnswer = req.Answer;
    else if (req.User == "Zainab") prompt.ZainabAnswer = req.Answer;

    // فحص القفل المزدوج
    if (!string.IsNullOrEmpty(prompt.MohammadAnswer) && !string.IsNullOrEmpty(prompt.ZainabAnswer)) {

        // 🕒 اللمسة الجديدة: توثيق تاريخ ووقت كسر القفل (اللحظة التي تكتمل فيها الذكرى)
        prompt.DateAdded = DateTime.Now.ToString("dd MMM yyyy, hh:mm tt");

        await SendTelegramNotification($"🔓 THE DUAL-LOCK IS BROKEN!\nBoth of you have answered the Blind Prompt. Go check the Vault to read the answers! ✨");
    } else {
        string displayUser = req.User == "Mohammad" ? "7amodee" : (req.User == "Zainab" ? "ZoZo" : req.User);
        string target = req.User == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";
        await SendTelegramNotification($"🔒 {displayUser} has locked their answer in the Blind Prompt! Waiting for {target} to answer...");
    }

    // حفظ جميع التغييرات (الإجابة + الوقت الجديد) في قاعدة البيانات
    await db.SaveChangesAsync();

    return Results.Ok(prompt);
});

app.MapDelete("/api/prompts/current", async (VaultDb db) => {
    // 🧹 مسح *جميع* الأسئلة المعلقة لإنهاء الجلسة تماماً من جذورها
    var unfinished = await db.BlindPrompts
        .Where(p => p.MohammadAnswer == null || p.ZainabAnswer == null)
        .ToListAsync();

    if (unfinished.Any()) {
        db.BlindPrompts.RemoveRange(unfinished);
        await db.SaveChangesAsync();
        await SendTelegramNotification("🚫 The current Blind Prompt session was cancelled.");
    }

    return Results.Ok();
});

app.MapGet("/api/media", async (VaultDb db) => {
    return await db.MediaItems.OrderByDescending(m => m.Id).ToListAsync();
});

app.MapPost("/api/media", async (MediaItem item, VaultDb db) => {
    db.MediaItems.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/media/{item.Id}", item);
});

app.MapPut("/api/media/{id}/status", async (int id, string newStatus, VaultDb db) => {
    var item = await db.MediaItems.FindAsync(id);
    if (item == null) return Results.NotFound();
    
    item.Status = newStatus;
    await db.SaveChangesAsync();
    return Results.Ok(item);
});

app.MapDelete("/api/media/{id}", async (int id, VaultDb db) => {
    var item = await db.MediaItems.FindAsync(id);
    if (item != null) {
        db.MediaItems.Remove(item);
        await db.SaveChangesAsync();
    }
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
    public DbSet<BlindPrompt> BlindPrompts => Set<BlindPrompt>();
    public DbSet<MediaItem> MediaItems { get; set; }
}

class Link {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
    [JsonPropertyName("unlockDate")] public string? UnlockDate { get; set; }
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
    [JsonPropertyName("visitDatesId")] public int VisitDatesId { get; set; }
}

public class TaskToggleRequest 
{
    [JsonPropertyName("localTime")]
    public string? LocalTime { get; set; }
}

public class SosRequest 
{
    [JsonPropertyName("user")] public string User { get; set; } = string.Empty;
    [JsonPropertyName("lat")] public double? Lat { get; set; }
    [JsonPropertyName("lng")] public double? Lng { get; set; }
}

class BlindPrompt {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("question")] public string Question { get; set; } = string.Empty;
    [JsonPropertyName("mohammadAnswer")] public string? MohammadAnswer { get; set; }
    [JsonPropertyName("zainabAnswer")] public string? ZainabAnswer { get; set; }
    [JsonPropertyName("dateAdded")] public string? DateAdded { get; set; }
}

public class AnswerRequest {
    [JsonPropertyName("user")] public string User { get; set; } = string.Empty;
    [JsonPropertyName("answer")] public string Answer { get; set; } = string.Empty;
}

public class MediaItem
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Status { get; set; } = "backlog"; 
    public string AddedBy { get; set; }
    public DateTime DateAdded { get; set; } = DateTime.UtcNow;
}