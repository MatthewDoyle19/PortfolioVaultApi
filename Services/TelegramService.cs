using System.Text;

namespace ZainabVaultApi.Services;

public class TelegramService
{
    private readonly HttpClient _httpClient = new();

    public async Task SendNotificationAsync(string message)
    {
        string botToken = "8899922136:AAEU5IWwZLw_LsdoWwkXywTd0FfVrSgPzSw";
        string chatId = "-5233134027";

        string url = $"https://api.telegram.org/bot{botToken}/sendMessage";

        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            chat_id = chatId,
            text = message
        });

        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        try
        {
            await _httpClient.PostAsync(url, content);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[TELEGRAM ERROR] {ex.Message}");
        }
    }
}
