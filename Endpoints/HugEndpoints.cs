using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class HugEndpoints
{
    public static void MapHugEndpoints(this WebApplication app)
    {
        app.MapGet("/api/hugs", async (VaultDb db) =>
        {
            var counter = await db.HugCounters.FirstOrDefaultAsync();
            if (counter == null)
            {
                counter = new HugCounter { Count = 0 };
                db.HugCounters.Add(counter);
                await db.SaveChangesAsync();
            }
            return Results.Ok(counter);
        });

        // سنستخدم نفس نموذج MansafActionRequest لأنه يحتوي فقط على Change
        app.MapPost("/api/hugs/action", async (MansafActionRequest req, VaultDb db, TelegramService telegram) =>
        {
            var counter = await db.HugCounters.FirstOrDefaultAsync();
            if (counter == null)
            {
                counter = new HugCounter { Count = 0 };
                db.HugCounters.Add(counter);
            }
            
            counter.Count += req.Change;

            var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
            var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

            db.HugLogs.Add(new HugLog { Change = req.Change, Timestamp = dbFriendlyTime });
            await db.SaveChangesAsync();

            string actionWord = req.Change > 0 ? "sent a virtual hug 🫂" : "removed a hug 💔";
            await telegram.SendNotificationAsync($"🫂 Hugs Update!\n\nZoZo {actionWord}.\nTotal Hugs Pending: {counter.Count} ❤️");

            return Results.Ok(counter);;
        });
    }
}