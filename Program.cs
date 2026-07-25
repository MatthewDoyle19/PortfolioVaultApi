using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.IO;
using System.Net.Http; // Required for Telegram

var builder = WebApplication.CreateBuilder(args);

// --- 1. THE BUILDER PHASE ---
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                       ?? "Host=ep-wandering-surf-asxjtab9-pooler.c-4.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_tA2Gp7iwTbBK;SSL Mode=Require;Trust Server Certificate=true";

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
    
    // 🕒 Adjusting time to Amman, Jordan timezone
    var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
    var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
    
    // Trick PostgreSQL into accepting our local time by specifying it as UTC
    var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);
    
    // Assign the time to your link object (Change 'CreatedAt' if your model uses a different name)
    link.CreatedAt = dbFriendlyTime;

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
    // 1. الحفظ في قاعدة البيانات 
    db.Commits.Add(commit);
    await db.SaveChangesAsync();

    // 2. حماية الكبسولة الزمنية (Data Encapsulation Logic)
    bool isTimeCapsule = !string.IsNullOrEmpty(commit.UnlockDate); 

    if (isTimeCapsule) {
        // --- THE FIX: Format Time for Telegram ---
        string displayTime = commit.UnlockDate;
        
        // محاولة تحويل النص إلى كائن DateTime
        if (DateTime.TryParse(commit.UnlockDate, null, System.Globalization.DateTimeStyles.RoundtripKind, out DateTime parsedDate))
        {
            // تحويل الوقت إلى UTC أولاً، ثم إضافة 3 ساعات للتوقيت المحلي، وتنسيقه ليظهر بصيغة 10:30 PM
            displayTime = parsedDate.ToUniversalTime().AddHours(3).ToString("yyyy-MM-dd 'at' hh:mm tt");
        }

        // إرسال الإشعار بالتوقيت المنسق
        await SendTelegramNotification($"⏳ THE VAULT ALERT: A new Time Capsule has been buried!\n\n🔒 It contains a secret memory that will unlock on {displayTime}. No peeking!");
    } else {
        await SendTelegramNotification($"📸 THE VAULT ALERT: A new memory has been added!\n\n📝 \"{commit.Message}\"");
    }

    return Results.Created($"/api/commits/{commit.Id}", commit);
});

app.MapDelete("/api/commits/{id}", async (int id, VaultDb db) => {
    var commit = await db.Commits.FindAsync(id);
    if (commit is null) return Results.NotFound();

    // التحقق مما إذا كانت الذاكرة المحذوفة كبسولة زمنية
    bool isTimeCapsule = !string.IsNullOrEmpty(commit.UnlockDate);

    // الحذف المباشر بدون أي قيود
    db.Commits.Remove(commit);
    await db.SaveChangesAsync();

    // إرسال إشعار التيليجرام بناءً على نوع الذاكرة المحذوفة
    if (isTimeCapsule) {
        await SendTelegramNotification($"🗑️ THE VAULT ALERT: A Time Capsule was destroyed before it even opened! The secret is lost forever. 🥀");
    } else {
        await SendTelegramNotification($"🗑️ THE VAULT ALERT: A memory was unfortunately deleted!\nLost description: {commit.Message}");
    }

    return Results.Ok();
});

// --- PENALTIES (Digital Court) ---
app.MapGet("/api/penalties", async (VaultDb db) => 
    await db.Penalties.OrderByDescending(p => p.Id).ToListAsync());

app.MapPost("/api/penalties", async (Penalty penalty, VaultDb db) => {
    db.Penalties.Add(penalty);
    await db.SaveChangesAsync();

    string displayPunisher = penalty.Punisher == "Mohammad" ? "7amodee" : (penalty.Punisher == "Zainab" ? "ZoZo" : penalty.Punisher);
    string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);

    await SendTelegramNotification($"⚖️ Digital Court: A new verdict has been issued!\n\nJudge: {displayPunisher}\nPunished: {displayPunished}\n\nVerdict:\n{penalty.PenaltyText}");
    return Results.Created($"/api/penalties/{penalty.Id}", penalty);
});

app.MapPut("/api/penalties/{id}/status", async (int id, StatusUpdateRequest request, VaultDb db) => {
    var penalty = await db.Penalties.FindAsync(id);
    if (penalty is null) return Results.NotFound();

    penalty.IsCompleted = request.IsCompleted;
    await db.SaveChangesAsync();

    string displayPunisher = penalty.Punisher == "Mohammad" ? "7amodee" : (penalty.Punisher == "Zainab" ? "ZoZo" : penalty.Punisher);
    string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);
    string statusText = request.IsCompleted ? "✅ COMPLETED!" : "🔄 RE-OPENED";
    string notificationMsg = $"⚖️ Court Update:\n\n{displayPunished} has marked a penalty as {statusText}\n\nOriginal Verdict from {displayPunisher}:\n{penalty.PenaltyText}";

    await SendTelegramNotification(notificationMsg);
    return Results.Ok(penalty);
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

// --- 📅 EVENTS (CALENDAR) ROUTES ---
app.MapGet("/api/events", async (VaultDb db) => 
    await db.Events.OrderBy(e => e.Date).ToListAsync());

app.MapPost("/api/events", async (Event ev, VaultDb db) => {
    db.Events.Add(ev);
    await db.SaveChangesAsync();

    // 🚀 إشعار إضافة حدث جديد
    await SendTelegramNotification($"📅 New Event Added to the Calendar!\n\n📌 Title: {ev.Title}\n🗓️ Date: {ev.Date}");

    return Results.Created($"/api/events/{ev.Id}", ev);
});

app.MapDelete("/api/events/{id}", async (int id, VaultDb db) => {
    var ev = await db.Events.FindAsync(id);
    if (ev is null) return Results.NotFound();
    
    db.Events.Remove(ev);
    await db.SaveChangesAsync();

    // 🚀 إشعار حذف الحدث
    await SendTelegramNotification($"🗑️ An event was removed from the Calendar!\n\n📌 Title: {ev.Title}");

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
    await SendTelegramNotification($"✨ {displaySender} is thinking of you right now and Love {target} 😘");

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
    // 🇯🇴 جلب توقيت الأردن
    var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));
    string timeString = jordanTime.ToString("hh:mm tt");

    var existingMood = await db.Moods.FirstOrDefaultAsync(m => m.User == req.User);
    if (existingMood != null) {
        existingMood.Status = "SOS";
        existingMood.UpdatedAt = timeString;
    } else {
        db.Moods.Add(new Mood { User = req.User, Status = "SOS", UpdatedAt = timeString });
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

var ourFutureQuestions = new List<string> {
    // --- 🧠 Cognitive & Intellectual Sync (التناغم الفكري والعقلي) ---
    "لو اضطرينا نتبادل عقولنا لمدة 24 ساعة، شو أكتر شي رح يفاجئ كل واحد فينا بطريقة تفكير وتحليل التاني للأمور؟ 🔄",
    "لما نتناقش بمواضيع معقدة، شو الشي اللي بخلّينا نحس إنو عقولنا بتكمل بعضها؟ 🧩",
    "كيف بنقدر نبني بيئة بتشجعنا إحنا التنين على النقد البنّاء لبعض بدون ما حدا فينا يحس بالهجوم أو التقليل من قيمته؟ 🗣️",
    "شو هو الفكرة أو المبدأ اللي أثر فينا، وحابين إننا نتبناه سوا كجزء من وعينا المشترك كفريق؟ 📚",
    "كيف بنقدر نخلي نقاشاتنا اليومية مساحة للتعلم المستمر، وتوسيع مداركنا إحنا التنين، مش بس لتبادل الأخبار الروتينية؟ 💡",

    // --- 🧱 Unbreakable Boundaries & Trust (بناء الحدود الصلبة والثقة) ---
    "شو هو التصرف اللي ممكن يبين بسيط للناس، بس بالنسبة لإلنا هو كسر كبير للثقة لازم نتجنبه تماماً؟ 🚫",
    "كيف بنرسم حدود صحية مع العالم الخارجي عشان نحمي خصوصيتنا وأسرارنا، ونحافظ على المساحة الآمنة تبعتنا؟ 🛡️",
    "لو حدا حاول يتدخل بعلاقتنا أو يزرع شك، شو هي الاستراتيجية المشتركة اللي رح نعتمدها لنكون جبهة وحدة ما بتنخترق؟ 🏰",
    "متى بيحس كل واحد فينا إنو بحاجة لمساحته الخاصة، وكيف بنقدر نعطي هاد الشي لبعض بدون ما نحس بالبعد أو الرفض؟ 🚪",
    "شو هو تعريفنا الخاص والدقيق، كشريكين، للـ 'خيانة العاطفية'، وكيف بنحمي قلوبنا من أي تشتت؟ 🔐",

    // --- 💸 Financial & Professional Synergy (الطموح المهني والذكاء المالي) ---
    "كيف رح نوازن بين طموحاتنا الشخصية (سواء بالبرمجة، الدراسة، أو مشاريعنا الخاصة) وبين وقتنا المشترك؟ 💻",
    "لو مرينا بضائقة مالية قاسية أو ضغط كبير، كيف رح نتعامل مع هاد التحدي سوا بدون ما نخليه يأثر على علاقتنا؟ 📉",
    "شو هو الهدف المالي أو الاستثماري اللي لازم نحققه قبل ما نوصل لعمر معين، وكيف رح نتعاون لنبنيه من الصفر؟ 💰",
    "كيف بيقدر كل واحد فينا يدعم التاني، لو واحد واجه إحباط مهني أو أكاديمي أو تأخر بخطوته؟ 🪜",
    "لو أجتنا فرصة ممتازة بس بتطلب منا تضحية بوقتنا سوا لفترة طويلة، كيف بناخد القرار كفريق؟ ⚖️",

    // --- 🎭 Shadow Work & Deep Vulnerability (مواجهة الجانب المظلم والضعف) ---
    "شو هي العادة أو العيب اللي كل واحد فينا خايف بيوم من الأيام يخلي التاني يملّ أو يتعب، وكيف بنعالجه سوا من اليوم؟ 🌘",
    "لما نمر بأسوأ حالاتنا (عصبية، إحباط، ضغط)، شو هي الطريقة الوحيدة اللي بيقدر فيها كل واحد يسحب التاني لبر الأمان؟ 🪢",
    "شو هو الموقف اللي حسينا فيه إننا كنا قاسيين على بعض، وما عرفنا كيف نعبر عن ندمنا أو نصلح الموقف وقتها؟ 🥀",
    "كيف بنخلي علاقتنا مكان آمن لنعبر فيه عن أي 'غيرة' أو 'انعدام أمان (Insecurity)' بدون ما نحس إننا ضعاف قدام بعض؟ 🫂",
    "لو اكتشفنا بيوم إنو في اختلاف جذري بطريقة تفكيرنا بموضوع حساس، كيف رح نخلق أسلوبنا المشترك اللي بيشبهنا إحنا وبس؟ 🌱",

    // --- 🎡 Pure Chaos & Joyful Madness (الفوضى الإيجابية والجنون المشترك) ---
    "لو قررنا نعمل مقلب أو مغامرة مجنونة جداً ما حدا بيتوقعها منا، شو رح تكون وين رح نعملها؟ 🎢",
    "شو هي النكتة أو الكلمة السخيفة اللي بس إحنا التنين بنفهمها، وبتقدر تموتنا ضحك بنص أي زعل؟ 😂",
    "لو حياتنا تحولت لمسلسل، مين فينا رح يكون الشخصية العاقلة ومين الشخصية المجنونة؟ 🎬",
    "لما نختيّر ويصير عمرنا 80 سنة، شو هي العادة الغريبة اللي بنتخيل إننا لسا رح نكون بنعملها سوا؟ 👴👵",
    "لو انحبسنا بمصعد لمدة 10 ساعات متواصلة بدون تليفوناتنا، كيف رح نقضي الوقت بدون ما نقتل بعض؟ 🚪",

    // --- 🧬 Legacy & Generational Impact (الأثر وما بعدنا) ---
    "لو صار عنا عيلة وأطفال بالمستقبل، شو هي القاعدة التربوية اللي مستحيل نتنازل عنها كفريق؟ 👨‍👩‍👧‍👦",
    "كيف بنقدر نضمن إنو أولادنا يشوفونا كـ 'قدوة' بالحب الحقيقي، مش بس كأهل بيمشوا أمور البيت؟ 🌟",
    "شو هو الأثر اللي حابين نتركه بالناس اللي حوالينا والمجتمع كـ 'Couple' بيلهم غيره؟ 🕊️",
    "لو قدرنا نكتب رسالة وحدة، ونخبيها ليقرؤوها أحفادنا، شو رح نكتب فيها عن سر قوتنا واستمرارنا؟ 📜",
    "كيف رح نحتفل بيوبيلنا الذهبي (50 سنة سوا)، وشو الإنجاز المشترك اللي رح نكون فخورين فيه أكتر شي؟ 🏅",

    // --- 🕰️ The Time Machine (آلة الزمن والتقييم) ---
    "لو رجعنا لأول محادثة بيناتنا بعقلية اليوم، شو الشي اللي كل واحد فينا رح يغيره أو يعمله بطريقة أحسن؟ ⏪",
    "متى كانت اللحظة الدقيقة اللي حسينا فيها إحنا التنين إننا انتقلنا من 'مجرد إعجاب' لـ 'انتماء حقيقي لا رجعة فيه'؟ ⚓",
    "شو هو أصعب يوم مر علينا لحد الآن، وكيف صار هاد اليوم بالذات هو حجر الأساس لقوتنا الحالية؟ 🧱",
    "لو قدرنا نشوف لمحة من حياتنا المشتركة بعد 5 سنين من اليوم لمدة دقيقة وحدة بس، شو بنتمنى نشوف؟ 🔮",
    "كيف بنقيّم تطور ذكائنا العاطفي ونضجنا بالتعامل مع بعض من أول يوم ارتبطنا فيه لحد اليوم؟ 🧠",

    // --- 🌌 The Soul's Expansion (اتساع الروح والتأمل) ---
    "لو كان كل واحد فينا عبارة عن فصل من فصول السنة، كيف بيخلق دمجنا 'طقس' خاص بعلاقتنا؟ 🍂🌸",
    "هل بنحس إنو أرواحنا تلاقت لسبب أكبر منا، ولا إحنا بنينا هاد الرابط بجهدنا وإرادتنا المشتركة؟ 💫",
    "كيف بنقدر نحول أي 'ألم' أو 'صعوبة' بنمر فيها لطاقة تبني علاقتنا وتقويها بدل ما تهدمها؟ 🏺",
    "لو طلبوا منا نختصر لغة الحب تبعتنا بحركة جسدية وحدة عفويّة (غير الحضن والمسك)، شو رح نختار؟ 🤲",
    "شو هي اللحظة اللي حسينا فيها إنو صمتنا بيحكي كل شي، وإننا قرأنا بعض من جوا بدون ولا حرف؟ 🤫",

    // --- 🧭 The Compass of Constant Renewal (بوصلة التجديد المستمر) ---
    "لما نحس إنو كل واحد فينا انغمس بروتينه، شو هو الـ Reset Button اللي بنضغطه لنرجع نتصل فوراً؟ 🔁",
    "شو هي العادة الجديدة اللي لازم ندخلها على يومنا لتعمق تواصلنا وتكسر أي ملل؟ ⏳",
    "كيف بنحافظ على الشغف بالاستكشاف؟ سواء استكشاف أماكن جديدة أو جوانب جديدة بشخصياتنا؟ 🗺️",
    "شو هو السؤال اللي لازم نسأله لبعض كل نهاية شهر عشان نقيم صحة علاقتنا بصدق وشفافية؟ 📊",
    "لو حسينا ببرود عاطفي مفاجئ، كيف بنتفق نكسر هاد الجليد قبل ما يتراكم ويصير جدار عازل بيناتنا؟ ⛏️",

    // --- 🏁 Final Pledges (العهود الأخيرة) ---
    "كيف بنوعد بعض إننا نضل 'الأصدقاء المفضلين' لبعض قبل ما نكون 'شركاء'، مهما كبرت مسؤولياتنا؟ 🤝",
    "شو هي الكلمة أو التصرف اللي بنعاهد بعض ما نستخدمه أبداً وقت الزعل عشان ما نكسر شي صعب يتصلح؟ 🤐",
    "لو كل العالم وقف ضدنا بيوم من الأيام، كيف بنوعد بعض إننا نضل ظهر وسند لبعض بدون أي تردد؟ 🛡️",
    "شو هو الشي اللي كل واحد فينا بيتمنى إنو التاني يركز على تطويره بشخصيته عشان نصير فريق أقوى وأنجح؟ 🌱",
    "شو هو الوعد النهائي اللي كل واحد فينا مستعد يقطعه للتاني عشان نختم فيه هاد الدستور، ونعتبره البند الأسمى؟ 📜"
};

app.MapPost("/api/prompts/generate", async (VaultDb db) => {
    // تنظيف الأسئلة القديمة
    var unfinished = await db.BlindPrompts
        .Where(p => p.MohammadAnswer == null || p.ZainabAnswer == null)
        .ToListAsync();

    if (unfinished.Any()) {
        db.BlindPrompts.RemoveRange(unfinished);
    }

    // 🇯🇴 جلب توقيت الأردن الحقيقي
    var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));

    var q = ourFutureQuestions[new Random().Next(ourFutureQuestions.Count)];
    var prompt = new BlindPrompt { Question = q, DateAdded = jordanTime.ToString("dd MMM yyyy") };
    db.BlindPrompts.Add(prompt);

    await db.SaveChangesAsync();

    await SendTelegramNotification($"💭 A new Blind Prompt has dropped in The Vault!\nGo answer it before the other does! 🔒");
    return Results.Ok(prompt);
});

app.MapPut("/api/prompts/{id}/answer", async (int id, AnswerRequest req, VaultDb db) => {
    var prompt = await db.BlindPrompts.FindAsync(id);
    if (prompt == null) return Results.NotFound();

    if (req.User == "Mohammad") prompt.MohammadAnswer = req.Answer;
    else if (req.User == "Zainab") prompt.ZainabAnswer = req.Answer;

    // فحص القفل المزدوج
    if (!string.IsNullOrEmpty(prompt.MohammadAnswer) && !string.IsNullOrEmpty(prompt.ZainabAnswer)) {
        
        // 🇯🇴 جلب توقيت الأردن لتوثيق اللحظة بالضبط
        var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));
        prompt.DateAdded = jordanTime.ToString("dd MMM yyyy, hh:mm tt");

        await SendTelegramNotification($"🔓 THE DUAL-LOCK IS BROKEN!\nBoth of you have answered the Blind Prompt. Go check the Vault to read the answers! ✨");
    } else {
        string displayUser = req.User == "Mohammad" ? "7amodee" : (req.User == "Zainab" ? "ZoZo" : req.User);
        string target = req.User == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";
        await SendTelegramNotification($"🔒 {displayUser} has locked their answer in the Blind Prompt! Waiting for {target} to answer...");
    }

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

// --- 🍿 THE WATCHLIST ROUTES ---
app.MapGet("/api/media", async (VaultDb db) => {
    return await db.MediaItems.OrderByDescending(m => m.Id).ToListAsync();
});

app.MapPost("/api/media", async (MediaItem item, VaultDb db) => {
    db.MediaItems.Add(item);
    await db.SaveChangesAsync();

    // 🚀 إشعار الإضافة
    string displayUser = item.AddedBy == "Mohammad" ? "7amodee 👨🏻‍💻" : (item.AddedBy == "Zainab" ? "ZoZo 👸🏻" : item.AddedBy);
    await SendTelegramNotification($"✨ A new movie was added to the Watchlist!\n\n🎬 Title: {item.Title}\n👤 Added by: {displayUser}");

    return Results.Created($"/api/media/{item.Id}", item);
});

app.MapPut("/api/media/{id}/status", async (int id, string newStatus, VaultDb db) => {
    var item = await db.MediaItems.FindAsync(id);
    if (item == null) return Results.NotFound();
    
    item.Status = newStatus;
    await db.SaveChangesAsync();

    // 🚀 إشعار التعديل (الصح)
    string statusText = newStatus == "watched" ? "✅ Watched" : "⏳ Backlog (Reverted)";
    await SendTelegramNotification($"🍿 Watchlist Update!\n\n🎬 Movie: {item.Title}\n📌 Status: {statusText}");

    return Results.Ok(item);
});

app.MapDelete("/api/media/{id}", async (int id, VaultDb db) => {
    var item = await db.MediaItems.FindAsync(id);
    if (item != null) {
        db.MediaItems.Remove(item);
        await db.SaveChangesAsync();

        // 🚀 إشعار الحذف
        await SendTelegramNotification($"🗑️ A movie was deleted from the Watchlist!\n\n🎬 Title: {item.Title}");
    }
    return Results.Ok();
});

// --- 🥘 MANSAF STANDALONE SYSTEM ---

// 1. The GET Route (Fixes the 404 Error)
app.MapGet("/api/mansaf", async (VaultDb db) => {
    var counter = await db.MansafCounters.FirstOrDefaultAsync();
    if (counter == null) {
        counter = new MansafCounter { Count = 0 };
        db.MansafCounters.Add(counter);
        await db.SaveChangesAsync();
    }
    return Results.Ok(counter);
});

// 2. The POST Route (Fixes the 500 Error with precise logging)
app.MapPost("/api/mansaf/action", async (MansafActionRequest req, VaultDb db) => {
    try {
        var counter = await db.MansafCounters.FirstOrDefaultAsync();
        if (counter == null) {
            counter = new MansafCounter { Count = 0 };
            db.MansafCounters.Add(counter);
        }
        
        // 1. تحديث العدد
        counter.Count += req.Change;
        
        // 2. استخراج توقيت الأردن الفعلي
        var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
        var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
        
        // 3. السحر الهندسي: إجبار قاعدة البيانات على قبول الوقت بدون خطأ 500
        var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);
        
        db.MansafLogs.Add(new MansafLog { 
            Change = req.Change, 
            Timestamp = dbFriendlyTime 
        });
        
        // 4. الحفظ في قاعدة البيانات
        await db.SaveChangesAsync();

        // 5. إشعار التيليجرام
        string actionWord = req.Change > 0 ? "added 🟢" : "removed 🔴";
        await SendTelegramNotification($"🥘 Mansaf Update!\n\n1 portion was {actionWord}.\nTotal Mansaf Count: {counter.Count} 🤤");

        return Results.Ok(counter);
        
    } catch (Exception ex) {
        Console.WriteLine($"[CRITICAL MANSAF DB ERROR] {ex.Message}");
        if (ex.InnerException != null) Console.WriteLine($"[INNER] {ex.InnerException.Message}");
        return Results.Problem(ex.Message);
    }
});

// // --- 🌀 THE QUANTUM PORTAL ---
// app.MapPost("/api/teleport", async (TeleportRequest req) => {
//     string displayUser = req.User == "Mohammad" ? "7amodee 👨🏻‍💻" : "ZoZo 👸🏻";
//     string displayDest = req.Destination == "Jordan" ? "Jordan 🇯🇴" : "Kafr Kanna 🇵🇸";
//     
//     await SendTelegramNotification($"{displayUser} just warped through space and time to arrive at {displayDest}! ✈️🤍");
//     
//     return Results.Ok();
// });

// --- 🎯 CORE GOALS ROUTES ---
app.MapGet("/api/goals", async (VaultDb db) => 
    await db.Goals.OrderBy(g => g.IsCompleted).ThenByDescending(g => g.CreatedAt).ToListAsync());

app.MapPost("/api/goals", async (Goal newGoal, VaultDb db) => {
    
    // 1. جلب توقيت الأردن الفعلي
    var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
    var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
    
    // 2. إجبار قاعدة البيانات على قبوله بدون أخطاء
    newGoal.CreatedAt = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);
    
    db.Goals.Add(newGoal);
    await db.SaveChangesAsync();

    // 🚀 إشعار التيليجرام 
    await SendTelegramNotification($"🎯 New Core Goal Set!\n\nGoal: {newGoal.Title}\nTime: {jordanTime:hh:mm tt}\n\nLet's make it happen! 💪");

    return Results.Created($"/api/goals/{newGoal.Id}", newGoal);
});

app.MapPut("/api/goals/{id}", async (int id, VaultDb db) => {
    var goal = await db.Goals.FindAsync(id);
    if (goal is null) return Results.NotFound();

    // تبديل حالة الهدف (إنجاز / تراجع)
    goal.IsCompleted = !goal.IsCompleted;
    await db.SaveChangesAsync();

    // 🚀 إشعار التيليجرام عند الإنجاز
    string statusText = goal.IsCompleted ? "✅ Achieved!" : "🔄 Re-opened";
    await SendTelegramNotification($"🎯 Goal Update:\n\nGoal: {goal.Title}\nStatus: {statusText}");

    return Results.Ok(goal);
});

app.MapDelete("/api/goals/{id}", async (int id, VaultDb db) => {
    var goal = await db.Goals.FindAsync(id);
    if (goal is null) return Results.NotFound();
    
    db.Goals.Remove(goal);
    await db.SaveChangesAsync();

    // 🚀 إشعار التيليجرام عند الحذف
    await SendTelegramNotification($"🗑️ A Core Goal was deleted:\n\nGoal: {goal.Title}");

    return Results.Ok();
});

// --- 📖 SECRET DIARY ROUTES (SINGLE NOTEBOOK MODE) ---

// 1. فتح الدفتر (جلب النص الحالي)
app.MapGet("/api/diary/{owner}", async (string owner, VaultDb db) => {
    // نبحث عن دفتر المستخدم، إذا لم نجده نرجع دفتر فارغ برمجياً لتجنب الأخطاء
    var entry = await db.DiaryEntries.FirstOrDefaultAsync(d => d.Owner == owner);
    
    return Results.Ok(entry ?? new DiaryEntry { Owner = owner, Content = "" });
});

// 2. الحفظ في الدفتر (تحديث المستند الوحيد)
app.MapPost("/api/diary", async (bool isManual, DiaryEntry request, VaultDb db) => {
    
    // ضبط توقيت الأردن الفعلي
    var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
    var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
    var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

    // نبحث إذا كان المستخدم يملك دفتراً مسبقاً
    var existingEntry = await db.DiaryEntries.FirstOrDefaultAsync(d => d.Owner == request.Owner);

    if (existingEntry != null) {
        existingEntry.Content = request.Content;
        existingEntry.CreatedAt = dbFriendlyTime; 
    } else {
        request.CreatedAt = dbFriendlyTime;
        db.DiaryEntries.Add(request);
    }

    await db.SaveChangesAsync();

    // 🚀 السحر هنا: إرسال الإشعار *فقط* إذا كان الحفظ يدوياً (عن طريق الزر)
    if (isManual) {
        string displayUser = request.Owner == "Mohammad" ? "7amodee 👨🏻‍💻" : (request.Owner == "Zainab" ? "ZoZo 👸🏻" : request.Owner);
        await SendTelegramNotification($"📖 The Secret Diary:\n\n{displayUser} just securely saved new thoughts in their private notebook! 🤫");
    }

    return Results.Ok(new { success = true });
});

// --- ⚙️ SYSTEM MAINTENANCE ROUTES ---

// Fetch current maintenance status
app.MapGet("/api/system/maintenance", async (VaultDb db) => {
    var setting = await db.SystemSettings.FirstOrDefaultAsync();
    return Results.Ok(setting ?? new SystemSetting { IsMaintenance = false });
});

// Toggle maintenance mode (Called from developer dashboard)
app.MapPost("/api/system/maintenance/toggle", async (VaultDb db) => {
    var setting = await db.SystemSettings.FirstOrDefaultAsync();
    if (setting == null) {
        setting = new SystemSetting { IsMaintenance = true };
        db.SystemSettings.Add(setting);
    } else {
        setting.IsMaintenance = !setting.IsMaintenance;
    }
    await db.SaveChangesAsync();

    string statusText = setting.IsMaintenance ? "🔴 ENABLED (Surprise Mode Active)" : "🟢 DISABLED (Public)";
    await SendTelegramNotification($"⚙️ System Update: Maintenance Mode is now {statusText}");

    return Results.Ok(setting);
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
    public DbSet<MansafCounter> MansafCounters => Set<MansafCounter>();
    public DbSet<MansafLog> MansafLogs => Set<MansafLog>();
    public DbSet<Goal> Goals { get; set; }
    public DbSet<DiaryEntry> DiaryEntries { get; set; }
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();}

class Link {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
    [JsonPropertyName("unlockDate")] public string? UnlockDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

class Commit {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("date")] public string Date { get; set; } = string.Empty;
    [JsonPropertyName("message")] public string Message { get; set; } = string.Empty;
    [JsonPropertyName("imageUrl")] public string? ImageUrl { get; set; } 
    [JsonPropertyName("audioUrl")] public string? AudioUrl { get; set; }
    [JsonPropertyName("unlockDate")] public string? UnlockDate { get; set; }
}

public class StatusUpdateRequest {
    [System.Text.Json.Serialization.JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }
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

class MansafCounter {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("count")] public int Count { get; set; }
}

class MansafLog {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("change")] public int Change { get; set; }
    [JsonPropertyName("timestamp")] public DateTime Timestamp { get; set; }
}

public class MansafActionRequest { 
    public int Change { get; set; } 
}

public class TeleportRequest {
    [JsonPropertyName("user")] public string User { get; set; } = string.Empty;
    [JsonPropertyName("destination")] public string Destination { get; set; } = string.Empty;
}

public class Goal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // إضافة ممتازة للتوثيق
}

public class DiaryEntry
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("owner")] public string Owner { get; set; } = string.Empty;
    [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
    [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class SystemSetting {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("isMaintenance")] public bool IsMaintenance { get; set; }
}