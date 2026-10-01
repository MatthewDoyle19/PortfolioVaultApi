using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class TaskToggleRequest
{
    [JsonPropertyName("localTime")]
    public string? LocalTime { get; set; }
}
