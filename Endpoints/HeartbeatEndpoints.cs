using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class HeartbeatEndpoints
{
    public static void MapHeartbeatEndpoints(this WebApplication app)
    {
        app.MapGet("/api/heartbeats/latest", async (VaultDb db) =>
            await db.Heartbeats.OrderByDescending(h => h.Id).FirstOrDefaultAsync());

        app.MapPost("/api/heartbeats", async (Heartbeat hb, VaultDb db, TelegramService telegram) =>
        {
            db.Heartbeats.Add(hb);
            await db.SaveChangesAsync();

            string displaySender = hb.Sender == "Mohammad" ? "7amodee" : (hb.Sender == "Zainab" ? "ZoZo" : hb.Sender);
            string target = hb.Sender == "Mohammad" ? "ZoZo 👸🏻" : "7amodee 👨🏻‍💻";
            await telegram.SendNotificationAsync($"✨ {displaySender} is thinking of you right now and Love {target} 😘");

            return Results.Ok(hb);
        });
    }
}
