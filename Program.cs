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
    // 1. الحفظ في قاعدة البيانات أولاً (الترتيب هنا صحيح لديك)
    db.Commits.Add(commit);
    await db.SaveChangesAsync();

    // 2. حماية الكبسولة الزمنية (Data Encapsulation Logic)
    // تحقق مما إذا كانت هذه الذكرى عبارة عن كبسولة زمنية (عدل 'UnlockDate' حسب ما تستخدمه في الكلاس)
    bool isTimeCapsule = !string.IsNullOrEmpty(commit.UnlockDate); 

    if (isTimeCapsule) {
        // إذا كانت كبسولة: نرسل إشعاراً تشويقياً بدون كشف الرسالة
        await SendTelegramNotification($"⏳ THE VAULT ALERT: A new Time Capsule has been buried!\n\n🔒 It contains a secret memory that will unlock on {commit.UnlockDate}. No peeking!");
    } else {
        // إذا كانت ذكرى عادية: نعرض الرسالة بشكل طبيعي
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
    await SendTelegramNotification($"✨ {displaySender} is thinking of {target} right now and Love {target} 😘");

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
    // --- 🏗️ Foundation & Core Values (تأسيس القواعد والمبادئ المشتركة) ---
    "لو بدنا نكتب 'دستور' لعلاقتنا، شو هو أول وأهم بند لازم نتفق عليه وما نتنازل عنه أبداً؟ 📜",
    "شو هي القيمة أو المبدأ الأساسي (احترام، صدق، مساحة شخصية..) اللي رح نعتبره خط أحمر ببيتنا بالمستقبل؟ ⚖️",
    "كيف بنقدر نضمن إنه مهما انشغلنا بحياتنا العملية والدراسية، نضل إحنا الأولوية لبعض؟ 🎯",
    "لو سألنا حالنا بعد 10 سنين: 'شو سر استمرارنا؟' شو بنتمنى يكون الجواب؟ 🗝️",

    // --- 🤝 Teamwork & Storm Navigation (العمل الجماعي وإدارة الخلافات) ---
    "لما نختلف على موضوع كبير، شو هي الطريقة الأصح اللي لازم نعتمدها عشان نوصل لحل بدون ما نجرح بعض؟ 🗣️",
    "شو هي 'خطة الطوارئ' اللي لازم نعملها لما واحد فينا يحس بضعف أو إحباط شديد عشان التاني يرفعه؟ 🛟",
    "كيف بنقدر ندعم بعض بأوقات الضغط المالي أو المهني اللي أكيد رح تواجهنا بالمستقبل؟ 💰",
    "لما نكون زعلانين من بعض، شو هو التصرف أو الكلمة اللي بتكسر الجليد وبترجعنا لطبيعتنا فوراً؟ 🧊",
    "كيف بنقدر نحافظ على مساحتنا الشخصية وهواياتنا جوا العلاقة بدون ما نحس إننا بنبعد عن بعض؟ 🪐",
    "شو هو التحدي أو الموقف الصعب اللي مرينا فيه بالـ 100 يوم الماضية، وأثبتلنا إننا فريق قوي؟ 🛡️",

    // --- 🚀 Growth & Mutual Evolution (النمو والتأثير المتبادل) ---
    "شو هو الهدف المشترك اللي لازم نبلش نشتغل عليه من اليوم عشان نرتاح بحياتنا بعدين؟ 📈",
    "كيف بنشوف إنو وجودنا سوا سرّع أو حسّن من تطورنا الشخصي والأكاديمي خلال الفترة الماضية؟ 🌱",
    "شو هي الصفة أو المهارة اللي كل واحد فينا حابب يتعلمها من التاني ليكون نسخة أفضل من حاله؟ 🔄",
    "كيف بنقدر نكون 'الدرع' لبعض ضد أي طاقة سلبية أو إحباط ممكن يجينا من العالم الخارجي؟ 🛡️",
    "لو أخدنا قرار مصيري (زي النقل لبلد تاني، أو تغيير تخصص/شغل)، كيف رح يكون شكل دعمنا لبعض بهيك خطوة؟ 🗺️",

    // --- 🏡 The Dream Life & Everyday Magic (الحياة اليومية وسحر التفاصيل) ---
    "لو كان عنا عطلة نهاية أسبوع كاملة وميزانية مفتوحة بس ممنوع نطلع من البيت، كيف بنقضيها سوا؟ 🛋️",
    "شو هي الأغنية أو اللحن اللي بدنا إياه يكون الـ Soundtrack الرسمي لحياتنا اليومية المشتركة؟ 🎶",

    // --- 🧠 Connection & Deep Empathy (الترابط الروحي والتعاطف) ---
    "شو هي اللحظة أو الموقف اللي حسينا فيها إحنا التنين بنفس الوقت إنو 'هذا هو المكان الصح والشخص الصح'؟ ⚡",
    "كيف بنقدر نخلي لغة الحب والاهتمام بيناتنا متجددة وما تتحول لروتين باهت مع مرور السنين؟ 💌",
    "شو هو السر أو التفصيل الصغير جداً اللي بيخص علاقتنا وما حدا بالدنيا بيعرفه وبيفهمه غيرنا إحنا التنين؟ 🤫",
    "لما نكون بمكان عام ومعجوق بالناس، شو هي النظرة أو الإشارة السرية اللي رح نستخدمها لنفهم بعض بدون ما نحكي ولا كلمة؟ 👁️",
    "لو كان الحب بينقاس بالأفعال مش بالوقت، شو هو أكتر فعل عملناه لبعض بيعكس قوة هاد الرابط؟ 🔗",

    // --- 🔭 Wildcards & Visionary Planning (تخيلات وخطط جريئة) ---
    "لو قررنا فجأة نترك كل شي ونفتح مشروعنا الخاص أو 'بزنس' يجمعنا سوا، شو رح يكون مجاله؟ 💡",
    "لو كان مسموح إلنا نختار بلد وحدة أو مدينة وحدة نعيش وتستقر فيها كل عمرنا، وين رح تكون وليه هاد المكان بالذات؟ ✈️",
    "شو هي المغامرة المجنونة أو التجربة اللي التنين خايفين منها بس متفقين إنه لازم نجربها سوا يوم من الأيام؟ 🧗🏻‍♂️",
    "لو بدنا نكتب كتاب عن قصة الـ 100 يوم الماضية وكيف بنينا هاد التفاهم، شو رح يكون عنوان الفصل الأخير فيه؟ 📖",
    "شو هو الوعد الصادق اللي كل واحد فينا مستعد يقطعه للتاني هسا، ويلتزم فيه لآخر العمر؟ 🤝",
    
    // --- 🪞 Mirrors & Inner Healing (المرايا والتشافي الروحي) ---
    "كيف بنشوف إنو علاقتنا ساعدت كل واحد فينا يتصالح مع أخطاء أو مخاوف قديمة كانت عنده قبل ما نلتقي؟ 🩹",
    "شو هو الجرح أو الخوف اللي كان عند واحد فينا، وحسينا إنو أماننا مع بعض عالجه بدون ما نحس؟ 🤍",
    "لما نكون بأضعف حالاتنا النفسية ومنهكين من الدنيا، كيف بنقدر نكون 'الملجأ' اللي ما بيحكم، بل بيحتوي؟ 🫂",
    "شو هو أجمل جزء أو صفة فيني (أو فيك) ما كنت منتبهله، بس عيون التاني خلته يكتشفه ويحبه؟ 🪞",
    "لو اضطرينا بيوم من الأيام نواجه نسخة قديمة وسيئة من حالنا، كيف رح نساعد بعض نتجاوزها بدون عتاب؟ 🛡️",

    // --- 🌌 Philosophical & Soul-Deep (فلسفة العلاقة والارتباط الروحي) ---
    "هل بتحس/ي إنو لقاءنا كان صدفة بحتة، ولا كان في سلسلة قرارات ومواقف رتبت هاد اللقاء لسبب أكبر منا؟ 🌠",
    "متى كانت اللحظة الصامتة اللي حسينا فيها إنو أرواحنا بتفهم بعض أسرع من كلامنا وعقولنا؟ 🪶",
    "شو هو المفهوم أو الفكرة القديمة اللي كانت عنا عن 'الحب'، واكتشفنا إنها تغيرت تماماً وعرفت معناها الحقيقي بعد ما ارتبطنا؟ 🔄",
    "لو كان الحب تبعنا عبارة عن طاقة ملموسة بيقدروا الناس يشوفوها، شو اللون أو الإحساس اللي رح يعكسه للي حوالينا؟ 🎨",
    "لو لغينا كل الكلمات واللغات من العالم، كيف رح نقدر نعبر لبعض عن كمية الحب والأمان اللي جواتنا؟ 🤫",

    // --- ⚓ Anchors & Radical Honesty (المراسي والشفافية المطلقة) ---
    "لو في يوم بعد سنين حسينا إنو شرارة الشغف قلت بسبب الروتين، شو هي خطتنا السريعة عشان نرجع نشعلها فوراً؟ 🔥",
    "شو هو الوعد اللي قطعناه لبعض بصمت ونظرات، وبنعرف إحنا التنين إنو مستحيل نكسره مهما مر علينا؟ 🔐",
    "كيف بنقدر نضمن إننا نضل 'أصدقاء' مقربين جداً لبعض، بنلعب وبنضحك وبنتشارك أسرار، مش بس زوجين ببيت واحد؟ 🎈",
    "لو كان باقي بحياتنا يوم واحد بس نعيشه سوا، شو هو الاعتراف أو الكلمة اللي رح نختم فيها هاد اليوم؟ ⏳",
    "شو هي الفكرة أو الشعور اللي مخبيه بقلبك هسا، وحابب/ة تشاركه معي عشان نختم فيه نقاشنا الليلة؟ 💌"
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