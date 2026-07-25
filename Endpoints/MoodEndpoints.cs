using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class MoodEndpoints
{
    public static void MapMoodEndpoints(this WebApplication app)
    {
        app.MapGet("/api/moods", async (VaultDb db) => await db.Moods.ToListAsync());

        app.MapPost("/api/moods", async (Mood newMood, VaultDb db, TelegramService telegram) =>
        {
            var existing = await db.Moods.FirstOrDefaultAsync(m => m.User == newMood.User);
            if (existing != null)
            {
                existing.Status = newMood.Status;
                existing.UpdatedAt = newMood.UpdatedAt;
            }
            else
            {
                db.Moods.Add(newMood);
            }
            await db.SaveChangesAsync();

            string alertEmoji = newMood.Status == "SOS" ? "🚨 EMERGENCY!" : "📡 Mood Update:";
            string displayUser = newMood.User == "Mohammad" ? "7amodee" : (newMood.User == "Zainab" ? "ZoZo" : newMood.User);

            await telegram.SendNotificationAsync($"{alertEmoji}\n{displayUser} updated their status to ({newMood.Status})\nat {newMood.UpdatedAt}");

            return Results.Ok(newMood);
        });
    }
}
