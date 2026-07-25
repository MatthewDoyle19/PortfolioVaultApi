using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class SystemEndpoints
{
    public static void MapSystemEndpoints(this WebApplication app)
    {
        app.MapGet("/api/system/maintenance", async (VaultDb db) =>
        {
            var setting = await db.SystemSettings.FirstOrDefaultAsync();
            return Results.Ok(setting ?? new SystemSetting { IsMaintenance = false });
        });

        app.MapPost("/api/system/maintenance/toggle", async (VaultDb db, TelegramService telegram) =>
        {
            var setting = await db.SystemSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new SystemSetting { IsMaintenance = true };
                db.SystemSettings.Add(setting);
            }
            else
            {
                setting.IsMaintenance = !setting.IsMaintenance;
            }
            await db.SaveChangesAsync();

            string statusText = setting.IsMaintenance ? "🔴 ENABLED (Surprise Mode Active)" : "🟢 DISABLED (Public)";
            await telegram.SendNotificationAsync($"⚙️ System Update: Maintenance Mode is now {statusText}");

            return Results.Ok(setting);
        });
    }
}
