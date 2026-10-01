using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class MansafCounter
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("count")] public int Count { get; set; }
}
