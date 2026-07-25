using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class StatusUpdateRequest
{
    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }
}
