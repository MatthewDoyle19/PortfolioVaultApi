using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class MediaEndpoints
{
    public static void MapMediaEndpoints(this WebApplication app)
    {
        app.MapGet("/api/media", async (VaultDb db) =>
        {
            return await db.MediaItems.OrderByDescending(m => m.Id).ToListAsync();
        });

        app.MapPost("/api/media", async (MediaItem item, VaultDb db, TelegramService telegram) =>
        {
            db.MediaItems.Add(item);
            await db.SaveChangesAsync();

            string displayUser = item.AddedBy == "User1" ? "Admin 👨🏻‍💻" : (item.AddedBy == "User2" ? "Member 👩🏻‍💻" : item.AddedBy);
            await telegram.SendNotificationAsync($"✨ A new item was added to the Watchlist!\n\n🎬 Title: {item.Title}\n👤 Added by: {displayUser}");

            return Results.Created($"/api/media/{item.Id}", item);
        });

        app.MapPut("/api/media/{id}/status", async (int id, string newStatus, VaultDb db, TelegramService telegram) =>
        {
            var item = await db.MediaItems.FindAsync(id);
            if (item == null) return Results.NotFound();

            item.Status = newStatus;
            await db.SaveChangesAsync();

            string statusText = newStatus == "watched" ? "✅ Completed" : "⏳ Backlog";
            await telegram.SendNotificationAsync($"🍿 Watchlist Update!\n\n🎬 Item: {item.Title}\n📌 Status: {statusText}");

            return Results.Ok(item);
        });

        app.MapDelete("/api/media/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var item = await db.MediaItems.FindAsync(id);
            if (item != null)
            {
                db.MediaItems.Remove(item);
                await db.SaveChangesAsync();
                await telegram.SendNotificationAsync($"🗑️ An item was deleted from the Watchlist!\n\n🎬 Title: {item.Title}");
            }
            return Results.Ok();
        });
    }
}