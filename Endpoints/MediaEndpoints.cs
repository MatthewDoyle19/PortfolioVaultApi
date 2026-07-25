using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

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

            string displayUser = item.AddedBy == "Mohammad" ? "7amodee 👨🏻‍💻" : (item.AddedBy == "Zainab" ? "ZoZo 👸🏻" : item.AddedBy);
            await telegram.SendNotificationAsync($"✨ A new movie was added to the Watchlist!\n\n🎬 Title: {item.Title}\n👤 Added by: {displayUser}");

            return Results.Created($"/api/media/{item.Id}", item);
        });

        app.MapPut("/api/media/{id}/status", async (int id, string newStatus, VaultDb db, TelegramService telegram) =>
        {
            var item = await db.MediaItems.FindAsync(id);
            if (item == null) return Results.NotFound();

            item.Status = newStatus;
            await db.SaveChangesAsync();

            string statusText = newStatus == "watched" ? "✅ Watched" : "⏳ Backlog (Reverted)";
            await telegram.SendNotificationAsync($"🍿 Watchlist Update!\n\n🎬 Movie: {item.Title}\n📌 Status: {statusText}");

            return Results.Ok(item);
        });

        app.MapDelete("/api/media/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var item = await db.MediaItems.FindAsync(id);
            if (item != null)
            {
                db.MediaItems.Remove(item);
                await db.SaveChangesAsync();

                await telegram.SendNotificationAsync($"🗑️ A movie was deleted from the Watchlist!\n\n🎬 Title: {item.Title}");
            }
            return Results.Ok();
        });
    }
}
