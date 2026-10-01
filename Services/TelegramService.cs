using System.Text;

namespace PortfolioVaultApi.Services;

public class TelegramService
{
    private readonly HttpClient _httpClient = new();

    public async Task SendNotificationAsync(string message)
    {
        // تم وضع بيانات وهمية للـ Portfolio
        string botToken = "YOUR_BOT_TOKEN_HERE";
        string chatId = "YOUR_CHAT_ID_HERE";

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