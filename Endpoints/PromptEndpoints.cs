using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class PromptEndpoints
{
    private static readonly List<string> OurFutureQuestions = new()
    {
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

    public static void MapPromptEndpoints(this WebApplication app)
    {
        app.MapGet("/api/prompts/history", async (VaultDb db) =>
        {
            return await db.BlindPrompts
                .Where(p => p.MohammadAnswer != null && p.ZainabAnswer != null)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        });

        app.MapGet("/api/prompts/current", async (VaultDb db) =>
        {
            return await db.BlindPrompts.OrderByDescending(p => p.Id).FirstOrDefaultAsync();
        });

        app.MapPost("/api/prompts/generate", async (VaultDb db, TelegramService telegram) =>
        {
            var unfinished = await db.BlindPrompts
                .Where(p => p.MohammadAnswer == null || p.ZainabAnswer == null)
                .ToListAsync();

            if (unfinished.Any())
            {
                db.BlindPrompts.RemoveRange(unfinished);
            }

            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));

            var q = OurFutureQuestions[new Random().Next(OurFutureQuestions.Count)];
            var prompt = new BlindPrompt { Question = q, DateAdded = jordanTime.ToString("dd MMM yyyy") };
            db.BlindPrompts.Add(prompt);

            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"💭 A new Blind Prompt has dropped in The Vault!\nGo answer it before the other does! 🔒");
            return Results.Ok(prompt);
        });

        app.MapPut("/api/prompts/{id}/answer", async (int id, AnswerRequest req, VaultDb db, TelegramService telegram) =>
        {
            var prompt = await db.BlindPrompts.FindAsync(id);
            if (prompt == null) return Results.NotFound();

            if (req.User == "Mohammad") prompt.MohammadAnswer = req.Answer;
            else if (req.User == "Zainab") prompt.ZainabAnswer = req.Answer;

            if (!string.IsNullOrEmpty(prompt.MohammadAnswer) && !string.IsNullOrEmpty(prompt.ZainabAnswer))
            {
                var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));
                prompt.DateAdded = jordanTime.ToString("dd MMM yyyy, hh:mm tt");

                await telegram.SendNotificationAsync($"🔓 THE DUAL-LOCK IS BROKEN!\nBoth of you have answered the Blind Prompt. Go check the Vault to read the answers! ✨");
            }
            else
            {
                string displayUser = req.User == "Mohammad" ? "7amodee" : (req.User == "Zainab" ? "ZoZo" : req.User);
                string target = req.User == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";
                await telegram.SendNotificationAsync($"🔒 {displayUser} has locked their answer in the Blind Prompt! Waiting for {target} to answer...");
            }

            await db.SaveChangesAsync();
            return Results.Ok(prompt);
        });

        app.MapDelete("/api/prompts/current", async (VaultDb db, TelegramService telegram) =>
        {
            var unfinished = await db.BlindPrompts
                .Where(p => p.MohammadAnswer == null || p.ZainabAnswer == null)
                .ToListAsync();

            if (unfinished.Any())
            {
                db.BlindPrompts.RemoveRange(unfinished);
                await db.SaveChangesAsync();
                await telegram.SendNotificationAsync("🚫 The current Blind Prompt session was cancelled.");
            }

            return Results.Ok();
        });
    }
}
