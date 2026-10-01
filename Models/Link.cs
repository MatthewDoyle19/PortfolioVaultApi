using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class Link
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
    [JsonPropertyName("unlockDate")] public string? UnlockDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
