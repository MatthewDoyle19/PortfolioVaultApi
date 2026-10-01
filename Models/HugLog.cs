using System.Text.Json.Serialization;
namespace PortfolioVaultApi.Models;
public class HugLog {
    
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("change")] public int Change { get; set; }
    [JsonPropertyName("timestamp")] public DateTime Timestamp { get; set; }
}