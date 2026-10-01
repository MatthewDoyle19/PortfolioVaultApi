using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class BucketListEndpoints
{
    public static void MapBucketListEndpoints(this WebApplication app)
    {
        app.MapGet("/api/bucketlist", async (VaultDb db) =>
            await db.BucketListItems.OrderBy(b => b.IsCompleted).ThenByDescending(b => b.Id).ToListAsync());

        app.MapPost("/api/bucketlist", async (BucketListItem item, VaultDb db, TelegramService telegram) =>
        {
            db.BucketListItems.Add(item);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"📋 A new objective was added to the Goals List!\nObjective: {item.Title}");

            return Results.Created($"/api/bucketlist/{item.Id}", item);
        });

        app.MapPut("/api/bucketlist/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var item = await db.BucketListItems.FindAsync(id);
            if (item is null) return Results.NotFound();

            item.IsCompleted = !item.IsCompleted;
            await db.SaveChangesAsync();

            string status = item.IsCompleted ? "✅ Completed" : "🔄 Reverted";
            await telegram.SendNotificationAsync($"📋 Goals Update:\nObjective: {item.Title}\nStatus: {status}");

            return Results.Ok(item);
        });

        app.MapDelete("/api/bucketlist/{id}", async (int id, VaultDb db) =>
        {
            var item = await db.BucketListItems.FindAsync(id);
            if (item is null) return Results.NotFound();
            db.BucketListItems.Remove(item);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}