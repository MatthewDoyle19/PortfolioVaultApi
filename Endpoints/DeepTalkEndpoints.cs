using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class DeepTalkEndpoints
{
    public static void MapDeepTalkEndpoints(this WebApplication app)
    {
        app.MapGet("/api/deeptalks", async (VaultDb db) =>
            await db.DeepTalks
                .OrderBy(t => t.IsDiscussed)
                .ThenByDescending(t => t.Id)
                .ToListAsync());

        app.MapPost("/api/deeptalks", async (DeepTalk talk, VaultDb db, TelegramService telegram) =>
        {
            db.DeepTalks.Add(talk);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"💬 New Discussion Topic Added:\n{talk.Title}");

            return Results.Created($"/api/deeptalks/{talk.Id}", talk);
        });

        app.MapPut("/api/deeptalks/{id}", async (int id, DeepTalk updateData, VaultDb db) =>
        {
            var talk = await db.DeepTalks.FindAsync(id);
            if (talk == null) return Results.NotFound();

            talk.IsDiscussed = updateData.IsDiscussed;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        app.MapDelete("/api/deeptalks/{id}", async (int id, VaultDb db) =>
        {
            var talk = await db.DeepTalks.FindAsync(id);
            if (talk == null) return Results.NotFound();

            db.DeepTalks.Remove(talk);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}