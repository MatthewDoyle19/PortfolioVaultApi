using System.Text.Json.Serialization;

namespace PortfolioVaultApi.Models;
public class VisitDates
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("startDate")] public string StartDate { get; set; } = string.Empty;
    [JsonPropertyName("endDate")] public string EndDate { get; set; } = string.Empty;
}
