using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class PromptEndpoints
{
    private static readonly List<string> OurFutureQuestions = new()
    {
        "What is the most challenging bug you've fixed recently, and what did it teach you? 🐛",
        "If we had to rebuild this entire project from scratch, which technology stack would we choose today? 💻",
        "What is one feature you believe is missing from our current system architecture? 🏗️",
        "How do you prefer to handle technical debt when approaching tight deadlines? ⏱️",
        "What is your ultimate career goal in the next 3 years? 🚀"
    };

    public static void MapPromptEndpoints(this WebApplication app)
    {
        app.MapGet("/api/prompts/history", async (VaultDb db) =>
        {
            return await db.BlindPrompts
                .Where(p => p.User1Answer != null && p.User2Answer != null)
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
                .Where(p => p.User1Answer == null || p.User2Answer == null)
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

            await telegram.SendNotificationAsync($"💭 A new System Prompt was generated!\nGo answer it before the other does! 🔒");
            return Results.Ok(prompt);
        });

        app.MapPut("/api/prompts/{id}/answer", async (int id, AnswerRequest req, VaultDb db, TelegramService telegram) =>
        {
            var prompt = await db.BlindPrompts.FindAsync(id);
            if (prompt == null) return Results.NotFound();

            if (req.User == "User1") prompt.User1Answer = req.Answer;
            else if (req.User == "User2") prompt.User2Answer = req.Answer;

            if (!string.IsNullOrEmpty(prompt.User1Answer) && !string.IsNullOrEmpty(prompt.User2Answer))
            {
                var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));
                prompt.DateAdded = jordanTime.ToString("dd MMM yyyy, hh:mm tt");

                await telegram.SendNotificationAsync($"🔓 THE LOCK IS BROKEN!\nBoth users have answered the Prompt. Go check the system to read the answers! ✨");
            }
            else
            {
                string displayUser = req.User == "User1" ? "Admin" : (req.User == "User2" ? "Member" : req.User);
                string target = req.User == "User1" ? "Member" : "Admin";
                await telegram.SendNotificationAsync($"🔒 {displayUser} locked their answer! Waiting for {target} to answer...");
            }

            await db.SaveChangesAsync();
            return Results.Ok(prompt);
        });

        app.MapDelete("/api/prompts/current", async (VaultDb db, TelegramService telegram) =>
        {
            var unfinished = await db.BlindPrompts
                .Where(p => p.User1Answer == null || p.User2Answer == null)
                .ToListAsync();

            if (unfinished.Any())
            {
                db.BlindPrompts.RemoveRange(unfinished);
                await db.SaveChangesAsync();
                await telegram.SendNotificationAsync("🚫 The current Prompt session was cancelled.");
            }

            return Results.Ok();
        });
    }
}