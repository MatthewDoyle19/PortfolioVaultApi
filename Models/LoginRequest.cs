using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class LoginRequest
{
    [JsonPropertyName("key")] public string Key { get; set; } = string.Empty;
}
