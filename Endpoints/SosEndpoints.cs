using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class SosEndpoints
{
    public static void MapSosEndpoints(this WebApplication app)
    {
        app.MapPost("/api/sos", async (SosRequest req, VaultDb db, TelegramService telegram) =>
        {
            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman"));
            string timeString = jordanTime.ToString("hh:mm tt");

            var existingMood = await db.Moods.FirstOrDefaultAsync(m => m.User == req.User);
            if (existingMood != null)
            {
                existingMood.Status = "SOS";
                existingMood.UpdatedAt = timeString;
            }
            else
            {
                db.Moods.Add(new Mood { User = req.User, Status = "SOS", UpdatedAt = timeString });
            }
            await db.SaveChangesAsync();

            string mapLink = (req.Lat.HasValue && req.Lng.HasValue)
                ? $"\n📍 Live Location: https://www.google.com/maps?q={req.Lat},{req.Lng}"
                : "\n📍 Location: (Location services were denied/disabled by device)";

            string displayUser = req.User == "User1" ? "Admin" : (req.User == "User2" ? "Member" : req.User);
            string target = req.User == "User1" ? "Member" : "Admin";

            await telegram.SendNotificationAsync($"🚨 SYSTEM ALERT 🚨\n\n{displayUser} triggered a system ping to {target}!{mapLink}");

            return Results.Ok();
        });
    }
}