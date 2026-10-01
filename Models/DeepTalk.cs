namespace PortfolioVaultApi.Models;

public class DeepTalk
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AddedBy { get; set; } = string.Empty;
    public bool IsDiscussed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow.AddHours(3);
}