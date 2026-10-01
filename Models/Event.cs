using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class Event
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("date")] public string Date { get; set; } = string.Empty;
    [JsonPropertyName("type")] public string Type { get; set; } = "Task";
}
