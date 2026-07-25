using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class DiaryEndpoints
{
    public static void MapDiaryEndpoints(this WebApplication app)
    {
        app.MapGet("/api/diary/{owner}", async (string owner, VaultDb db) =>
        {
            var entry = await db.DiaryEntries.FirstOrDefaultAsync(d => d.Owner == owner);

            return Results.Ok(entry ?? new DiaryEntry { Owner = owner, Content = "" });
        });

        app.MapPost("/api/diary", async (bool isManual, DiaryEntry request, VaultDb db, TelegramService telegram) =>
        {
            var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
            var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

            var existingEntry = await db.DiaryEntries.FirstOrDefaultAsync(d => d.Owner == request.Owner);

            if (existingEntry != null)
            {
                existingEntry.Content = request.Content;
                existingEntry.CreatedAt = dbFriendlyTime;
            }
            else
            {
                request.CreatedAt = dbFriendlyTime;
                db.DiaryEntries.Add(request);
            }

            await db.SaveChangesAsync();

            if (isManual)
            {
                string displayUser = request.Owner == "Mohammad" ? "7amodee 👨🏻‍💻" : (request.Owner == "Zainab" ? "ZoZo 👸🏻" : request.Owner);
                await telegram.SendNotificationAsync($"📖 The Secret Diary:\n\n{displayUser} just securely saved new thoughts in their private notebook! 🤫");
            }

            return Results.Ok(new { success = true });
        });
    }
}
