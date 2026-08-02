using Microsoft.EntityFrameworkCore;
using ZainabVaultApi.Data;
using ZainabVaultApi.Endpoints;
using ZainabVaultApi.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                       ?? "Host=ep-wandering-surf-asxjtab9-pooler.c-4.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_tA2Gp7iwTbBK;SSL Mode=Require;Trust Server Certificate=true";

builder.Services.AddDbContext<VaultDb>(options => options.UseNpgsql(connectionString));
builder.Services.AddSingleton<TelegramService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowFrontend");

app.MapAuthEndpoints();
app.MapLinkEndpoints();
app.MapCommitEndpoints();
app.MapPenaltyEndpoints();
app.MapMoodEndpoints();
app.MapEventEndpoints();
app.MapHeartbeatEndpoints();
app.MapBucketListEndpoints();
app.MapVisitEndpoints();
app.MapSosEndpoints();
app.MapPromptEndpoints();
app.MapMediaEndpoints();
app.MapMansafEndpoints();
app.MapGoalEndpoints();
app.MapDiaryEndpoints();
app.MapSystemEndpoints();
app.MapDeepTalkEndpoints();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VaultDb>();
    db.Database.EnsureCreated();
}

app.Run();
