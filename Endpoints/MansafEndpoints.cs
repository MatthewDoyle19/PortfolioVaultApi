using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class MansafEndpoints
{
    public static void MapMansafEndpoints(this WebApplication app)
    {
        app.MapGet("/api/mansaf", async (VaultDb db) =>
        {
            var counter = await db.MansafCounters.FirstOrDefaultAsync();
            if (counter == null)
            {
                counter = new MansafCounter { Count = 0 };
                db.MansafCounters.Add(counter);
                await db.SaveChangesAsync();
            }
            return Results.Ok(counter);
        });

        app.MapPost("/api/mansaf/action", async (MansafActionRequest req, VaultDb db, TelegramService telegram) =>
        {
            try
            {
                var counter = await db.MansafCounters.FirstOrDefaultAsync();
                if (counter == null)
                {
                    counter = new MansafCounter { Count = 0 };
                    db.MansafCounters.Add(counter);
                }

                counter.Count += req.Change;

                var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
                var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
                var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

                db.MansafLogs.Add(new MansafLog
                {
                    Change = req.Change,
                    Timestamp = dbFriendlyTime
                });

                await db.SaveChangesAsync();

                string actionWord = req.Change > 0 ? "added 🟢" : "removed 🔴";
                await telegram.SendNotificationAsync($"🥘 Mansaf Update!\n\n1 portion was {actionWord}.\nTotal Mansaf Count: {counter.Count} 🤤");

                return Results.Ok(counter);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CRITICAL MANSAF DB ERROR] {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"[INNER] {ex.InnerException.Message}");
                return Results.Problem(ex.Message);
            }
        });
    }
}
