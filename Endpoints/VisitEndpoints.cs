using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Models;
using PortfolioVaultApi.Services;

namespace PortfolioVaultApi.Endpoints;

public static class VisitEndpoints
{
    public static void MapVisitEndpoints(this WebApplication app)
    {
        app.MapGet("/api/visit/all", async (VaultDb db) =>
        {
            var dates = await db.VisitDates.OrderByDescending(d => d.Id).ToListAsync();
            var tasks = await db.VisitTasks.ToListAsync();

            var result = dates.Select(d => new
            {
                Id = d.Id,
                StartDate = d.StartDate,
                EndDate = d.EndDate,
                Tasks = tasks.Where(t => t.VisitDatesId == d.Id).OrderBy(t => t.IsCompleted).ThenBy(t => t.Id).ToList()
            });

            return Results.Ok(result);
        });

        app.MapPost("/api/visit/dates", async (VisitDates dates, VaultDb db, TelegramService telegram) =>
        {
            db.VisitDates.Add(dates);
            await db.SaveChangesAsync();
            await telegram.SendNotificationAsync($"📅 New Schedule Planned: From {dates.StartDate} to {dates.EndDate}");
            return Results.Ok(dates);
        });

        app.MapPost("/api/visit/tasks", async (VisitTask task, VaultDb db, TelegramService telegram) =>
        {
            db.VisitTasks.Add(task);
            await db.SaveChangesAsync();
            await telegram.SendNotificationAsync($"📌 New task added to the schedule: {task.Title}");
            return Results.Created($"/api/visit/tasks/{task.Id}", task);
        });

        app.MapPut("/api/visit/tasks/{id}", async (int id, TaskToggleRequest req, VaultDb db, TelegramService telegram) =>
        {
            var task = await db.VisitTasks.FindAsync(id);
            if (task is null) return Results.NotFound();

            task.IsCompleted = !task.IsCompleted;
            task.CompletedAt = task.IsCompleted ? req.LocalTime : null;

            await db.SaveChangesAsync();

            string status = task.IsCompleted ? $"✅ Done at {task.CompletedAt}" : "❌ Reverted";
            await telegram.SendNotificationAsync($"📌 Schedule Update:\nTask: {task.Title}\nStatus: {status}");

            return Results.Ok(task);
        });

        app.MapDelete("/api/visit/tasks/{id}", async (int id, VaultDb db) =>
        {
            var task = await db.VisitTasks.FindAsync(id);
            if (task is null) return Results.NotFound();
            db.VisitTasks.Remove(task);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        app.MapDelete("/api/visit/dates/{id}", async (int id, VaultDb db, TelegramService telegram) =>
        {
            var trip = await db.VisitDates.FindAsync(id);
            if (trip is null) return Results.NotFound();

            db.VisitDates.Remove(trip);
            await db.SaveChangesAsync();

            await telegram.SendNotificationAsync($"🗑️️ A schedule block ({trip.StartDate} to {trip.EndDate}) was deleted from the system.");

            return Results.Ok();
        });
    }
}