using Orleans;
using CLF.Shared.Models;

namespace CLF.Ingestion.Grains.Interfaces;

/// <summary>
/// Base interface for all ingestion grains
/// </summary>
public interface IIngestionGrain : IGrainWithStringKey
{
    /// <summary>
    /// Initialize the ingestion grain with configuration
    /// </summary>
    Task InitializeAsync(ExternalDataSource source);

    /// <summary>
    /// Start polling the external data source
    /// </summary>
    Task StartPollingAsync();

    /// <summary>
    /// Stop polling the external data source
    /// </summary>
    Task StopPollingAsync();

    /// <summary>
    /// Process incoming webhook data
    /// </summary>
    Task ProcessWebhookAsync(string payload);

    /// <summary>
    /// Get the current status of the ingestion grain
    /// </summary>
    Task<IngestionGrainStatus> GetStatusAsync();

    /// <summary>
    /// Manually trigger a data fetch
    /// </summary>
    Task<IngestionResult> TriggerFetchAsync();
}

/// <summary>
/// Status of an ingestion grain
/// </summary>
public class IngestionGrainStatus
{
    public string SourceName { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public bool IsPolling { get; set; }
    public DateTime? LastFetchTime { get; set; }
    public DateTime? NextFetchTime { get; set; }
    public int TotalFetches { get; set; }
    public int SuccessfulFetches { get; set; }
    public int FailedFetches { get; set; }
    public string? LastError { get; set; }
    public Dictionary<string, object> Metrics { get; set; } = new();
}

/// <summary>
/// Result of an ingestion operation
/// </summary>
public class IngestionResult
{
    public bool Success { get; set; }
    public int RecordsProcessed { get; set; }
    public int RecordsFailed { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime ProcessedAt { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
} 