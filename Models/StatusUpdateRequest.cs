using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class StatusUpdateRequest
{
    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }
}
