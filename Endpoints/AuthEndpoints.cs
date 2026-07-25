using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", async (LoginRequest request, TelegramService telegram) =>
        {
            const string secureKey = "2503";
            if (request.Key == secureKey)
            {
                await telegram.SendNotificationAsync("🔓 Someone just unlocked the Vault!");
                return Results.Ok(new { success = true, message = "Access Granted" });
            }
            await telegram.SendNotificationAsync("⚠️ Failed attempt to access the Vault with an incorrect password!");
            return Results.Json(new { success = false, message = "Invalid Key" }, statusCode: 401);
        });
    }
}
