using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class EventEndpoints
{
    public static void MapEventEndpoints(this WebApplication app)
    {
        app.MapGet("/api/events", async (VaultDb db) =>
            await db.Events.OrderBy(e => e.Date).ToListAsync());

        app.MapPost("/api/events", async (Event ev, VaultDb db, TelegramService telegram) =>
        {
            db.Events.Add(ev);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"📅 New Event Added to the Calendar!\n\n📌 Title: {ev.Title}\n🗓️ Date: {ev.Date}");

            return Results.Created($"/api/events/{ev.Id}", ev);
        });

        app.MapDelete("/api/events/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var ev = await db.Events.FindAsync(id);
            if (ev is null) return Results.NotFound();

            db.Events.Remove(ev);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"🗑️ An event was removed from the Calendar!\n\n📌 Title: {ev.Title}");

            return Results.Ok();
        });
    }
}
