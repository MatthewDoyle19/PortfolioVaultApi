using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Models;
using ZainabVaultApi.Services;

namespace ZainabVaultApi.Endpoints;

public static class DeepTalkEndpoints
{
    public static void MapDeepTalkEndpoints(this WebApplication app)
    {
        // 1. جلب المواضيع (المرتبة بحيث تظهر المواضيع غير المتناقش فيها أولاً)
        app.MapGet("/api/deeptalks", async (VaultDb db) =>
            await db.DeepTalks
                .OrderBy(t => t.IsDiscussed)
                .ThenByDescending(t => t.Id)
                .ToListAsync());

        // 2. إضافة موضوع جديد (مع إشعار تيليجرام!)
        app.MapPost("/api/deeptalks", async (DeepTalk talk, VaultDb db, TelegramService telegram) =>
        {
            db.DeepTalks.Add(talk);
            await db.SaveChangesAsync();

            // إرسال إشعار فوري لكم على تيليجرام
           
            await telegram.SendNotificationAsync($"☕ New Deep Talk topic:\n{talk.Title}");

            return Results.Created($"/api/deeptalks/{talk.Id}", talk);
        });

        // 3. تحديث الحالة (تم النقاش / لم يتم)
        app.MapPut("/api/deeptalks/{id}", async (int id, DeepTalk updateData, VaultDb db) =>
        {
            var talk = await db.DeepTalks.FindAsync(id);
            if (talk == null) return Results.NotFound();

            talk.IsDiscussed = updateData.IsDiscussed;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // 4. الحذف
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