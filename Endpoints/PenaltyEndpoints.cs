using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

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

            string displayPunisher = penalty.Punisher == "User1" ? "Admin" : (penalty.Punisher == "User2" ? "Member" : penalty.Punisher);
            string displayPunished = penalty.Punished == "User1" ? "Admin" : (penalty.Punished == "User2" ? "Member" : penalty.Punished);

            await telegram.SendNotificationAsync($"⚖️ Task Assigned!\n\nAssigner: {displayPunisher}\nAssignee: {displayPunished}\n\nTask:\n{penalty.PenaltyText}");
            return Results.Created($"/api/penalties/{penalty.Id}", penalty);
        });

        app.MapPut("/api/penalties/{id}/status", async (int id, StatusUpdateRequest request, VaultDb db, TelegramService telegram) =>
        {
            var penalty = await db.Penalties.FindAsync(id);
            if (penalty is null) return Results.NotFound();

            penalty.IsCompleted = request.IsCompleted;
            await db.SaveChangesAsync();

            string displayPunisher = penalty.Punisher == "User1" ? "Admin" : (penalty.Punisher == "User2" ? "Member" : penalty.Punisher);
            string displayPunished = penalty.Punished == "User1" ? "Admin" : (penalty.Punished == "User2" ? "Member" : penalty.Punished);
            string statusText = request.IsCompleted ? "✅ COMPLETED!" : "🔄 RE-OPENED";
            string notificationMsg = $"⚖️ Task Update:\n\n{displayPunished} marked task as {statusText}\n\nOriginal Task from {displayPunisher}:\n{penalty.PenaltyText}";

            await telegram.SendNotificationAsync(notificationMsg);
            return Results.Ok(penalty);
        });

        app.MapDelete("/api/penalties/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var penalty = await db.Penalties.FindAsync(id);
            if (penalty is null) return Results.NotFound();
            db.Penalties.Remove(penalty);
            await db.SaveChangesAsync();

            string displayPunished = penalty.Punished == "User1" ? "Admin" : (penalty.Punished == "User2" ? "Member" : penalty.Punished);
            await telegram.SendNotificationAsync($"🗑️️ A task was deleted!\nThe assignee was: {displayPunished}");
            return Results.Ok();
        });
    }
}