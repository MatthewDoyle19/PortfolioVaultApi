using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Data;
using PortfolioVaultApi.Endpoints;
using PortfolioVaultApi.Services;

var builder = WebApplication.CreateBuilder(args);

// إعداد الخدمات (Services)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// إعداد قاعدة البيانات باستخدام الاسم الجديد
builder.Services.AddDbContext<VaultDb>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=vault.db"));

builder.Services.AddSingleton<TelegramService>();

// إعداد سياسة الـ CORS للسماح بالاتصال من الواجهة الأمامية
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");

// ربط جميع نقاط النهاية (Endpoints)
app.MapAuthEndpoints();
app.MapBucketListEndpoints();
app.MapDeepTalkEndpoints();
app.MapDiaryEndpoints();
app.MapEventEndpoints();
app.MapGoalEndpoints();
app.MapHeartbeatEndpoints();
app.MapHugEndpoints();
app.MapLinkEndpoints();
app.MapMansafEndpoints();
app.MapMediaEndpoints();
app.MapMoodEndpoints();
app.MapPenaltyEndpoints();
app.MapPromptEndpoints();
app.MapSosEndpoints();
app.MapSystemEndpoints();
app.MapVisitEndpoints();

app.Run();