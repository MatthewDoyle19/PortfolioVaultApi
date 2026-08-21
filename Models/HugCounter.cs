using System.Text.Json.Serialization;
namespace ZainabVaultApi.Models;

public class HugCounter {
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("count")] public int Count { get; set; }
}