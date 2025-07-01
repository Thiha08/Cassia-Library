using Orleans;
using Orleans.Streams;
using CLF.Shared.Models;

namespace CLF.Ingestion.Grains.Interfaces;

/// <summary>
/// ETL Grain interface for processing raw data into clean, structured data
/// </summary>
public interface IETLGrain : IGrainWithStringKey, IAsyncObserver<RawData>
{
    /// <summary>
    /// Initialize the ETL grain with processing configuration
    /// </summary>
    Task InitializeAsync(PipelineConfiguration config);

    /// <summary>
    /// Get ETL processing status and metrics
    /// </summary>
    Task<ETLProcessingStatus> GetStatusAsync();

    /// <summary>
    /// Manually trigger ETL processing for a specific raw data item
    /// </summary>
    Task<ETLProcessingResult> ProcessRawDataAsync(RawData rawData);

    /// <summary>
    /// Get processing statistics
    /// </summary>
    Task<ETLStatistics> GetStatisticsAsync();
}

/// <summary>
/// ETL processing status
/// </summary>
public class ETLProcessingStatus
{
    public string GrainId { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastProcessedTime { get; set; }
    public int TotalProcessed { get; set; }
    public int SuccessfullyProcessed { get; set; }
    public int FailedProcessing { get; set; }
    public string? LastError { get; set; }
    public Dictionary<string, object> ProcessingMetrics { get; set; } = new();
}

/// <summary>
/// ETL processing result
/// </summary>
public class ETLProcessingResult
{
    public bool Success { get; set; }
    public Guid RawDataId { get; set; }
    public Guid? CleanDataId { get; set; }
    public List<EventData> Events { get; set; } = new();
    public List<TimeSeriesData> TimeSeriesData { get; set; } = new();
    public List<GeoData> GeoData { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> ProcessingMetadata { get; set; } = new();
    public DateTime ProcessedAt { get; set; }
}

/// <summary>
/// ETL processing statistics
/// </summary>
public class ETLStatistics
{
    public int TotalRecordsProcessed { get; set; }
    public int SuccessfulRecords { get; set; }
    public int FailedRecords { get; set; }
    public double AverageProcessingTimeMs { get; set; }
    public Dictionary<string, int> ProcessingBySource { get; set; } = new();
    public Dictionary<string, int> ProcessingByType { get; set; } = new();
    public DateTime LastUpdated { get; set; }
} 