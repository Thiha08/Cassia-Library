using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;

namespace CLF.Ingestion.Grains;

public class TwitterIngestionGrain : BaseIngestionGrain
{
    public TwitterIngestionGrain(ILogger logger) : base(logger)
    {
    }

    protected override IDataSourceAdapter GetAdapter()
    {
        var httpClient = ServiceProvider.GetRequiredService<HttpClient>();
        return new TwitterAdapter(httpClient, _logger);
    }

    protected override string GetStreamNamespace() => "TWITTER";

    protected override async Task<RawData?> ProcessWebhookPayloadAsync(string payload)
    {
        // Twitter is poll-based, but could support webhooks in the future
        _logger.LogInformation("Processing Twitter webhook payload");
        return await Task.FromResult<RawData?>(null);
    }
} 