using Orleans;
using Orleans.Streams;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Grains;

public class EventStoreGrain : Grain, IEventStoreGrain
{
    private ILogger<EventStoreGrain> _logger;
    private EventStoreStatus _status = new();
    private EventStoreStatistics _statistics = new();
    private Dictionary<string, object>? _storageConfig;

    public EventStoreGrain(ILogger<EventStoreGrain> logger)
    {
        _logger = logger;
    }

    public override async Task OnActivateAsync()
    {
        // Subscribe to ETLGrain output stream (example namespace: "ETL")
        var streamProvider = GetStreamProvider("IngestionStreamProvider");
        var stream = streamProvider.GetStream<ETLProcessingResult>(this.GetPrimaryKeyString(), "ETL");
        await stream.SubscribeAsync(this);
        await base.OnActivateAsync();
    }

    public Task InitializeAsync(Dictionary<string, object> storageConfig)
    {
        _storageConfig = storageConfig;
        return Task.CompletedTask;
    }

    public Task<EventStoreStatus> GetStatusAsync() => Task.FromResult(_status);
    public Task<EventStoreStatistics> GetStatisticsAsync() => Task.FromResult(_statistics);

    public async Task<EventStoreResult> StoreProcessedDataAsync(ETLProcessingResult processedData)
    {
        // Simulate storage logic
        await Task.Delay(100);
        _status.LastStoredTime = DateTime.UtcNow;
        _status.TotalStored++;
        _status.SuccessfullyStored++;
        _statistics.TotalRecordsStored++;
        _statistics.SuccessfulStores++;
        _statistics.LastUpdated = DateTime.UtcNow;
        return new EventStoreResult
        {
            Success = true,
            ProcessedDataId = processedData.CleanDataId ?? Guid.NewGuid(),
            StoredEventIds = new List<Guid>(),
            StoredTimeSeriesIds = new List<Guid>(),
            StoredGeoDataIds = new List<Guid>(),
            StoredAt = DateTime.UtcNow
        };
    }

    public async Task<EventStoreResult> BatchStoreAsync(List<ETLProcessingResult> processedDataList)
    {
        var result = new EventStoreResult { Success = true, StoredAt = DateTime.UtcNow };
        foreach (var data in processedDataList)
        {
            var storeResult = await StoreProcessedDataAsync(data);
            if (!storeResult.Success) result.Success = false;
            result.StoredEventIds.AddRange(storeResult.StoredEventIds);
            result.StoredTimeSeriesIds.AddRange(storeResult.StoredTimeSeriesIds);
            result.StoredGeoDataIds.AddRange(storeResult.StoredGeoDataIds);
        }
        return result;
    }

    public async Task OnNextAsync(ETLProcessingResult item, StreamSequenceToken? token = null)
    {
        _logger.LogInformation("EventStoreGrain received ETL result: {CleanDataId}", item.CleanDataId);
        await StoreProcessedDataAsync(item);
    }

    public Task OnCompletedAsync() => Task.CompletedTask;
    public Task OnErrorAsync(Exception ex) { _logger.LogError(ex, "EventStoreGrain stream error"); return Task.CompletedTask; }
} 