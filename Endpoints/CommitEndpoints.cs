using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class CommitEndpoints
{
    public static void MapCommitEndpoints(this WebApplication app)
    {
        // app.MapGet("/api/commits", async (VaultDb db) =>
        //     await db.Commits.OrderByDescending(c => c.Date).ToListAsync());

        app.MapPost("/api/commits", async (Commit commit, VaultDb db, TelegramService telegram) =>
        {
            db.Commits.Add(commit);
            await db.SaveChangesAsync();

            bool isTimeCapsule = !string.IsNullOrEmpty(commit.UnlockDate);

            if (isTimeCapsule)
            {
                string displayTime = commit.UnlockDate!;

                if (DateTime.TryParse(commit.UnlockDate, null, System.Globalization.DateTimeStyles.RoundtripKind, out DateTime parsedDate))
                {
                    displayTime = parsedDate.ToUniversalTime().AddHours(3).ToString("yyyy-MM-dd 'at' hh:mm tt");
                }

                await telegram.SendNotificationAsync($"⏳ THE VAULT ALERT: A new Time Capsule has been buried!\n\n🔒 It contains a secret memory that will unlock on {displayTime}. No peeking!");
            }
            else
            {
                await telegram.SendNotificationAsync($"📸 THE VAULT ALERT: A new memory has been added!\n\n📝 \"{commit.Message}\"");
            }

            return Results.Created($"/api/commits/{commit.Id}", commit);
        });

        app.MapDelete("/api/commits/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var commit = await db.Commits.FindAsync(id);
            if (commit is null) return Results.NotFound();

            bool isTimeCapsule = !string.IsNullOrEmpty(commit.UnlockDate);

            db.Commits.Remove(commit);
            await db.SaveChangesAsync();

            if (isTimeCapsule)
            {
                await telegram.SendNotificationAsync($"🗑️ THE VAULT ALERT: A Time Capsule was destroyed before it even opened! The secret is lost forever. 🥀");
            }
            else
            {
                await telegram.SendNotificationAsync($"🗑️ THE VAULT ALERT: A memory was unfortunately deleted!\nLost description: {commit.Message}");
            }

            return Results.Ok();
        });
    }
}
