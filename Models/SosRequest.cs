using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class SosRequest
{
    [JsonPropertyName("user")] public string User { get; set; } = string.Empty;
    [JsonPropertyName("lat")] public double? Lat { get; set; }
    [JsonPropertyName("lng")] public double? Lng { get; set; }
}
