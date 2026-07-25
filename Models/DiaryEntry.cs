using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class DiaryEntry
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("owner")] public string Owner { get; set; } = string.Empty;
    [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
    [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
