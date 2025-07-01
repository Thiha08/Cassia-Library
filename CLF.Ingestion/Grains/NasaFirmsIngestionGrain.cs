using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;

namespace CLF.Ingestion.Grains;

/// <summary>
/// NASA FIRMS ingestion grain for satellite fire detection data
/// </summary>
public class NasaFirmsIngestionGrain : BaseIngestionGrain
{
    public NasaFirmsIngestionGrain(ILogger<NasaFirmsIngestionGrain> logger) : base(logger)
    {
    }

    protected override IDataSourceAdapter GetAdapter()
    {
        var httpClient = ServiceProvider.GetRequiredService<HttpClient>();
        return new NasaFirmsAdapter(httpClient, Logger);
    }

    protected override string GetStreamNamespace()
    {
        return "NASA_FIRMS";
    }

    protected override async Task<RawData?> ProcessWebhookPayloadAsync(string payload)
    {
        // NASA FIRMS doesn't typically use webhooks, but this could be used for real-time alerts
        // In a real implementation, this would parse the webhook payload and create RawData
        
        _logger.LogInformation("Processing NASA FIRMS webhook payload");
        
        // For now, return null as FIRMS is primarily poll-based
        return await Task.FromResult<RawData?>(null);
    }

    public override async Task<IngestionResult> TriggerFetchAsync()
    {
        // Override to add NASA FIRMS specific logic
        _logger.LogInformation("Triggering NASA FIRMS data fetch");
        
        var result = await base.TriggerFetchAsync();
        
        // Add NASA FIRMS specific metrics
        result.Metadata["SatelliteSystem"] = "VIIRS_SNPP";
        result.Metadata["DataProduct"] = "Fire Detection";
        
        return result;
    }
}