using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class TaskToggleRequest
{
    [JsonPropertyName("localTime")]
    public string? LocalTime { get; set; }
}
