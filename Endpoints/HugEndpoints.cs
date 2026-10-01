using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

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

        app.MapPost("/api/hugs/action", async (MansafActionRequest req, VaultDb db, TelegramService telegram) =>
        {
            var counter = await db.HugCounters.FirstOrDefaultAsync();
            if (counter == null)
            {
                counter = new HugCounter { Count = 0 };
                db.HugCounters.Add(counter);
            }

            if (req.Change < 0 && counter.Count <= 0)
            {
                return Results.Ok(counter); 
            }
    
            counter.Count += req.Change;

            var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
            var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

            db.HugLogs.Add(new HugLog { Change = req.Change, Timestamp = dbFriendlyTime });
            await db.SaveChangesAsync();

            string actionWord = req.Change > 0 ? "added a point 🟢" : "removed a point 🔴";
            await telegram.SendNotificationAsync($"📊 Points Update!\n\nUser {actionWord}.\nTotal Pending: {counter.Count}");

            return Results.Ok(counter);
        });
    }
}