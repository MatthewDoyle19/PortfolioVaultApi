using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class AnswerRequest
{
    [JsonPropertyName("user")] public string User { get; set; } = string.Empty;
    [JsonPropertyName("answer")] public string Answer { get; set; } = string.Empty;
}
