using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class VisitTask
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("isCompleted")] public bool IsCompleted { get; set; } = false;
    [JsonPropertyName("completedAt")] public string? CompletedAt { get; set; }
    [JsonPropertyName("visitDatesId")] public int VisitDatesId { get; set; }
}
