using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class BlindPrompt
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("question")] public string Question { get; set; } = string.Empty;
    [JsonPropertyName("mohammadAnswer")] public string? MohammadAnswer { get; set; }
    [JsonPropertyName("zainabAnswer")] public string? ZainabAnswer { get; set; }
    [JsonPropertyName("dateAdded")] public string? DateAdded { get; set; }
}
