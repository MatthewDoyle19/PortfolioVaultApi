using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class Heartbeat
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("sender")] public string Sender { get; set; } = string.Empty;
}
