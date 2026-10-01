using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class BlindPrompt
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("question")] public string Question { get; set; } = string.Empty;
    [JsonPropertyName("user1Answer")] public string? User1Answer { get; set; }
    [JsonPropertyName("user2Answer")] public string? User2Answer { get; set; }
    [JsonPropertyName("dateAdded")] public string? DateAdded { get; set; }
}