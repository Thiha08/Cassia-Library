using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;

namespace CLF.Ingestion.Grains;

public class USGSIngestionGrain : BaseIngestionGrain
{
    public USGSIngestionGrain(ILogger<USGSIngestionGrain> logger) : base(logger) { }

    protected override IDataSourceAdapter GetAdapter()
    {
        var httpClient = ServiceProvider.GetRequiredService<HttpClient>();
        return new USGSAdapter(httpClient, Logger);
    }

    protected override string GetStreamNamespace() => "USGS";

    protected override async Task<RawData?> ProcessWebhookPayloadAsync(string payload)
    {
        // USGS is poll-based, but could support webhooks in the future
        _logger.LogInformation("Processing USGS webhook payload");
        return await Task.FromResult<RawData?>(null);
    }
} 