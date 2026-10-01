using Microsoft.EntityFrameworkCore;
using PortfolioVaultApi.Models;

namespace PortfolioVaultApi.Data;

public class VaultDb : DbContext
{
    public VaultDb(DbContextOptions<VaultDb> options) : base(options) { }

    public DbSet<Link> Links => Set<Link>();
    public DbSet<Commit> Commits => Set<Commit>();
    public DbSet<Penalty> Penalties => Set<Penalty>();
    public DbSet<Mood> Moods => Set<Mood>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Heartbeat> Heartbeats => Set<Heartbeat>();
    public DbSet<BucketListItem> BucketListItems => Set<BucketListItem>();
    public DbSet<VisitDates> VisitDates => Set<VisitDates>();
    public DbSet<VisitTask> VisitTasks => Set<VisitTask>();
    public DbSet<BlindPrompt> BlindPrompts => Set<BlindPrompt>();
    public DbSet<MediaItem> MediaItems { get; set; }
    public DbSet<MansafCounter> MansafCounters => Set<MansafCounter>();
    public DbSet<MansafLog> MansafLogs => Set<MansafLog>();
    public DbSet<Goal> Goals { get; set; }
    public DbSet<DiaryEntry> DiaryEntries { get; set; }
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<DeepTalk> DeepTalks { get; set; }
    public DbSet<HugCounter> HugCounters { get; set; }
    public DbSet<HugLog> HugLogs { get; set; }
}