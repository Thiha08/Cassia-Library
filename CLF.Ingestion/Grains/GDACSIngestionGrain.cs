using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;

namespace CLF.Ingestion.Grains;

public class GDACSIngestionGrain : BaseIngestionGrain
{
    public GDACSIngestionGrain(ILogger logger) : base(logger)
    {
    }

    protected override IDataSourceAdapter GetAdapter()
    {
        var httpClient = ServiceProvider.GetRequiredService<HttpClient>();
        return new GDACSAdapter(httpClient, _logger);
    }

    protected override string GetStreamNamespace() => "GDACS";

    protected override async Task<RawData?> ProcessWebhookPayloadAsync(string payload)
    {
        // GDACS is poll-based, but could support webhooks in the future
        _logger.LogInformation("Processing GDACS webhook payload");
        return await Task.FromResult<RawData?>(null);
    }
} 