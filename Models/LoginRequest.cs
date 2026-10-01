using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class LoginRequest
{
    [JsonPropertyName("key")] public string Key { get; set; } = string.Empty;
}
