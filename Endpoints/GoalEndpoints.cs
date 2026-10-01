using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class GoalEndpoints
{
    public static void MapGoalEndpoints(this WebApplication app)
    {
        app.MapGet("/api/goals", async (VaultDb db) =>
            await db.Goals.OrderBy(g => g.IsCompleted).ThenByDescending(g => g.CreatedAt).ToListAsync());

        app.MapPost("/api/goals", async (Goal newGoal, VaultDb db, TelegramService telegram) =>
        {
            var jordanZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Amman");
            var jordanTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, jordanZone);
            newGoal.CreatedAt = DateTime.SpecifyKind(jordanTime, DateTimeKind.Utc);

            db.Goals.Add(newGoal);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"🎯 New System Goal Set!\n\nGoal: {newGoal.Title}\nTime: {jordanTime:hh:mm tt}");

            return Results.Created($"/api/goals/{newGoal.Id}", newGoal);
        });

        app.MapPut("/api/goals/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var goal = await db.Goals.FindAsync(id);
            if (goal is null) return Results.NotFound();

            goal.IsCompleted = !goal.IsCompleted;
            await db.SaveChangesAsync();

            string statusText = goal.IsCompleted ? "✅ Achieved!" : "🔄 Re-opened";
            await telegram.SendNotificationAsync($"🎯 Goal Update:\n\nGoal: {goal.Title}\nStatus: {statusText}");

            return Results.Ok(goal);
        });

        app.MapDelete("/api/goals/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var goal = await db.Goals.FindAsync(id);
            if (goal is null) return Results.NotFound();

            db.Goals.Remove(goal);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"🗑️ A System Goal was deleted:\n\nGoal: {goal.Title}");

            return Results.Ok();
        });
    }
}