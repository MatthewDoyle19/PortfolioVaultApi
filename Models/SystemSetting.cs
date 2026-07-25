using System.Text.Json.Serialization;

namespace ZainabVaultApi.Models;

public class SystemSetting
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("isMaintenance")] public bool IsMaintenance { get; set; }
}
