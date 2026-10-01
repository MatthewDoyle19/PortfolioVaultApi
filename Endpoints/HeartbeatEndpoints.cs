using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

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

            string displaySender = hb.Sender == "User1" ? "Admin" : (hb.Sender == "User2" ? "Member" : hb.Sender);
            string target = hb.Sender == "User1" ? "Member" : "Admin";
            await telegram.SendNotificationAsync($"✨ {displaySender} sent a signal to {target}");

            return Results.Ok(hb);
        });
    }
}