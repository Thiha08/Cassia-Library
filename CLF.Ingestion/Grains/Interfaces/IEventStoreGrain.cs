using Orleans;
using Orleans.Streams;
using CLF.Shared.Models;

namespace CLF.Ingestion.Grains.Interfaces;

/// <summary>
/// Event Store Grain interface for persisting processed data to various storage systems
/// </summary>
public interface IEventStoreGrain : IGrainWithStringKey, IAsyncObserver<ETLProcessingResult>
{
    /// <summary>
    /// Initialize the event store grain with storage configuration
    /// </summary>
    Task InitializeAsync(Dictionary<string, object> storageConfig);

    /// <summary>
    /// Get event store status and metrics
    /// </summary>
    Task<EventStoreStatus> GetStatusAsync();

    /// <summary>
    /// Manually store processed data
    /// </summary>
    Task<EventStoreResult> StoreProcessedDataAsync(ETLProcessingResult processedData);

    /// <summary>
    /// Get storage statistics
    /// </summary>
    Task<EventStoreStatistics> GetStatisticsAsync();

    /// <summary>
    /// Batch store multiple processed data items
    /// </summary>
    Task<EventStoreResult> BatchStoreAsync(List<ETLProcessingResult> processedDataList);
}

/// <summary>
/// Event store status
/// </summary>
public class EventStoreStatus
{
    public string GrainId { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastStoredTime { get; set; }
    public int TotalStored { get; set; }
    public int SuccessfullyStored { get; set; }
    public int FailedStorage { get; set; }
    public string? LastError { get; set; }
    public Dictionary<string, object> StorageMetrics { get; set; } = new();
    public Dictionary<string, bool> StorageSystemStatus { get; set; } = new();
}

/// <summary>
/// Event store result
/// </summary>
public class EventStoreResult
{
    public bool Success { get; set; }
    public Guid ProcessedDataId { get; set; }
    public List<Guid> StoredEventIds { get; set; } = new();
    public List<Guid> StoredTimeSeriesIds { get; set; } = new();
    public List<Guid> StoredGeoDataIds { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> StorageMetadata { get; set; } = new();
    public DateTime StoredAt { get; set; }
}

/// <summary>
/// Event store statistics
/// </summary>
public class EventStoreStatistics
{
    public int TotalRecordsStored { get; set; }
    public int SuccessfulStores { get; set; }
    public int FailedStores { get; set; }
    public double AverageStorageTimeMs { get; set; }
    public Dictionary<string, int> StorageByType { get; set; } = new();
    public Dictionary<string, int> StorageBySystem { get; set; } = new();
    public DateTime LastUpdated { get; set; }
} 