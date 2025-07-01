using Orleans;
using Orleans.Streams;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Grains;

public class ETLGrain : Grain, IETLGrain
{
    private ILogger<ETLGrain> _logger;
    private ETLProcessingStatus _status = new();
    private ETLStatistics _statistics = new();
    private PipelineConfiguration? _config;

    public ETLGrain(ILogger<ETLGrain> logger)
    {
        _logger = logger;
    }

    public override async Task OnActivateAsync()
    {
        // Subscribe to all relevant ingestion streams (example: NASA_FIRMS, USGS, etc.)
        var streamProvider = GetStreamProvider("IngestionStreamProvider");
        var namespaces = new[] { "NASA_FIRMS", "USGS", "GDACS", "TWITTER", "CASSIA_USER_REPORT" };
        foreach (var ns in namespaces)
        {
            var stream = streamProvider.GetStream<RawData>(this.GetPrimaryKeyString(), ns);
            await stream.SubscribeAsync(this);
        }
        await base.OnActivateAsync();
    }

    public Task InitializeAsync(PipelineConfiguration config)
    {
        _config = config;
        return Task.CompletedTask;
    }

    public Task<ETLProcessingStatus> GetStatusAsync() => Task.FromResult(_status);
    public Task<ETLStatistics> GetStatisticsAsync() => Task.FromResult(_statistics);

    public async Task<ETLProcessingResult> ProcessRawDataAsync(RawData rawData)
    {
        // Simulate ETL: clean, deduplicate, enrich, standardize
        var result = await ProcessRawDataInternalAsync(rawData);
        return result;
    }

    public async Task OnNextAsync(RawData item, StreamSequenceToken? token = null)
    {
        _logger.LogInformation("ETLGrain received raw data: {RawDataId}", item.Id);
        var result = await ProcessRawDataInternalAsync(item);
        // TODO: Publish to next Orleans stream (for EventStoreGrain)
    }

    public Task OnCompletedAsync() => Task.CompletedTask;
    public Task OnErrorAsync(Exception ex) { _logger.LogError(ex, "ETLGrain stream error"); return Task.CompletedTask; }

    private async Task<ETLProcessingResult> ProcessRawDataInternalAsync(RawData rawData)
    {
        // Simulate ETL logic
        await Task.Delay(100); // Simulate processing
        var cleanDataId = Guid.NewGuid();
        _status.LastProcessedTime = DateTime.UtcNow;
        _status.TotalProcessed++;
        _status.SuccessfullyProcessed++;
        _statistics.TotalRecordsProcessed++;
        _statistics.SuccessfulRecords++;
        _statistics.LastUpdated = DateTime.UtcNow;
        return new ETLProcessingResult
        {
            Success = true,
            RawDataId = rawData.Id,
            CleanDataId = cleanDataId,
            Events = new List<EventData>(),
            TimeSeriesData = new List<TimeSeriesData>(),
            GeoData = new List<GeoData>(),
            ProcessedAt = DateTime.UtcNow
        };
    }
} 