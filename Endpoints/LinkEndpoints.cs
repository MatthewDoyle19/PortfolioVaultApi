using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class LinkEndpoints
{
    public static void MapLinkEndpoints(this WebApplication app)
    {
        app.MapGet("/api/links", async (VaultDb db) => await db.Links.ToListAsync());

        app.MapPost("/api/links", async (Link link, VaultDb db, TelegramService telegram) =>
        {
            var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
            var dbFriendlyTime = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

            link.CreatedAt = dbFriendlyTime;

            db.Links.Add(link);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"🔗 A new link has been saved!\nTitle: {link.Title}");

            return Results.Created($"/api/links/{link.Id}", link);
        });

        app.MapDelete("/api/links/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var link = await db.Links.FindAsync(id);
            if (link is null) return Results.NotFound();
            db.Links.Remove(link);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"🗑️ A link was deleted from the Vault!\nTitle: {link.Title}");

            return Results.Ok();
        });
    }
}
