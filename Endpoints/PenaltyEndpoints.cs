using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class PenaltyEndpoints
{
    public static void MapPenaltyEndpoints(this WebApplication app)
    {
        app.MapGet("/api/penalties", async (VaultDb db) =>
            await db.Penalties.OrderByDescending(p => p.Id).ToListAsync());

        app.MapPost("/api/penalties", async (Penalty penalty, VaultDb db, TelegramService telegram) =>
        {
            db.Penalties.Add(penalty);
            await db.SaveChangesAsync();

            string displayPunisher = penalty.Punisher == "Mohammad" ? "7amodee" : (penalty.Punisher == "Zainab" ? "ZoZo" : penalty.Punisher);
            string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);

            await telegram.SendNotificationAsync($"⚖️ Digital Court: A new verdict has been issued!\n\nJudge: {displayPunisher}\nPunished: {displayPunished}\n\nVerdict:\n{penalty.PenaltyText}");
            return Results.Created($"/api/penalties/{penalty.Id}", penalty);
        });

        app.MapPut("/api/penalties/{id}/status", async (int id, StatusUpdateRequest request, VaultDb db, TelegramService telegram) =>
        {
            var penalty = await db.Penalties.FindAsync(id);
            if (penalty is null) return Results.NotFound();

            penalty.IsCompleted = request.IsCompleted;
            await db.SaveChangesAsync();

            string displayPunisher = penalty.Punisher == "Mohammad" ? "7amodee" : (penalty.Punisher == "Zainab" ? "ZoZo" : penalty.Punisher);
            string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);
            string statusText = request.IsCompleted ? "✅ COMPLETED!" : "🔄 RE-OPENED";
            string notificationMsg = $"⚖️ Court Update:\n\n{displayPunished} has marked a penalty as {statusText}\n\nOriginal Verdict from {displayPunisher}:\n{penalty.PenaltyText}";

            await telegram.SendNotificationAsync(notificationMsg);
            return Results.Ok(penalty);
        });

        app.MapDelete("/api/penalties/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var penalty = await db.Penalties.FindAsync(id);
            if (penalty is null) return Results.NotFound();
            db.Penalties.Remove(penalty);
            await db.SaveChangesAsync();

            string displayPunished = penalty.Punished == "Mohammad" ? "7amodee" : (penalty.Punished == "Zainab" ? "ZoZo" : penalty.Punished);
            await telegram.SendNotificationAsync($"🗑️ A verdict was deleted/canceled from the ledger!\nThe punished was: {displayPunished}");
            return Results.Ok();
        });
    }
}
