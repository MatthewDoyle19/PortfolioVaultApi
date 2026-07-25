using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

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

            string displayUser = req.User == "Mohammad" ? "7amodee" : (req.User == "Zainab" ? "ZoZo" : req.User);
            string target = req.User == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";

            await telegram.SendNotificationAsync($"🚨 EMERGENCY SOS TRIGGERED 🚨\n\n{displayUser} has pressed the panic button and needs {target} ASAP!{mapLink}");

            return Results.Ok();
        });
    }
}
