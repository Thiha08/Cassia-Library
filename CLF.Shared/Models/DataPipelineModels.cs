using Orleans;

namespace CLF.Shared.Models;

/// <summary>
/// Base model for all data pipeline entities
/// </summary>
[GenerateSerializer]
public abstract class BaseEntity
{
    [Id(0)]
    public Guid Id { get; set; }
    [Id(1)]
    public DateTime CreatedAt { get; set; }
    [Id(2)]
    public DateTime? UpdatedAt { get; set; }
    [Id(3)]
    public string CreatedBy { get; set; } = string.Empty;
    [Id(4)]
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// External data source configuration
/// </summary>
[GenerateSerializer]
public class ExternalDataSource : BaseEntity
{
    [Id(5)]
    public string Name { get; set; } = string.Empty;
    [Id(6)]
    public string Type { get; set; } = string.Empty; // API, Database, File, etc.
    [Id(7)]
    public string ConnectionString { get; set; } = string.Empty;
    [Id(8)]
    public Dictionary<string, string> Configuration { get; set; } = new();
    [Id(9)]
    public bool IsActive { get; set; } = true;
    [Id(10)]
    public TimeSpan PollingInterval { get; set; } = TimeSpan.FromMinutes(5);
}

/// <summary>
/// Raw data from external sources (staging)
/// </summary>
[GenerateSerializer]
public class RawData : BaseEntity
{
    [Id(5)]
    public Guid SourceId { get; set; }
    [Id(6)]
    public string DataType { get; set; } = string.Empty;
    [Id(7)]
    public string RawContent { get; set; } = string.Empty;
    [Id(8)]
    public Dictionary<string, object> Metadata { get; set; } = new();
    [Id(9)]
    public DataIngestionStatus Status { get; set; } = DataIngestionStatus.Pending;
    [Id(10)]
    public string? ErrorMessage { get; set; }
    [Id(11)]
    public int RetryCount { get; set; } = 0;
}

/// <summary>
/// Clean, processed data
/// </summary>
[GenerateSerializer]
public class CleanData : BaseEntity
{
    [Id(5)]
    public Guid RawDataId { get; set; }
    [Id(6)]
    public string DataType { get; set; } = string.Empty;
    [Id(7)]
    public Dictionary<string, object> ProcessedData { get; set; } = new();
    [Id(8)]
    public DataProcessingStatus Status { get; set; } = DataProcessingStatus.Pending;
    [Id(9)]
    public string? ErrorMessage { get; set; }
    [Id(10)]
    public Dictionary<string, object> ValidationResults { get; set; } = new();
}

/// <summary>
/// Event sourcing model
/// </summary>
[GenerateSerializer]
public class EventData : BaseEntity
{
    [Id(5)]
    public string EventType { get; set; } = string.Empty;
    [Id(6)]
    public string AggregateId { get; set; } = string.Empty;
    [Id(7)]
    public long Version { get; set; }
    [Id(8)]
    public Dictionary<string, object> Data { get; set; } = new();
    [Id(9)]
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Time series data model
/// </summary>
[GenerateSerializer]
public class TimeSeriesData : BaseEntity
{
    [Id(5)]
    public string MetricName { get; set; } = string.Empty;
    [Id(6)]
    public DateTime Timestamp { get; set; }
    [Id(7)]
    public double Value { get; set; }
    [Id(8)]
    public string Unit { get; set; } = string.Empty;
    [Id(9)]
    public Dictionary<string, string> Tags { get; set; } = new();
    [Id(10)]
    public string? Source { get; set; }
}

/// <summary>
/// Geospatial data model
/// </summary>
[GenerateSerializer]
public class GeoData : BaseEntity
{
    [Id(5)]
    public string Name { get; set; } = string.Empty;
    [Id(6)]
    public double Latitude { get; set; }
    [Id(7)]
    public double Longitude { get; set; }
    [Id(8)]
    public string? Address { get; set; }
    [Id(9)]
    public Dictionary<string, object> Properties { get; set; } = new();
    [Id(10)]
    public string? GeoJson { get; set; }
    [Id(11)]
    public string? GeometryType { get; set; }
}

/// <summary>
/// Pipeline processing status
/// </summary>
[GenerateSerializer]
public enum DataIngestionStatus
{
    Pending,
    InProgress,
    Completed,
    Failed,
    Retrying
}

[GenerateSerializer]
public enum DataProcessingStatus
{
    Pending,
    InProgress,
    Completed,
    Failed,
    Validated
}

/// <summary>
/// Pipeline configuration
/// </summary>
[GenerateSerializer]
public class PipelineConfiguration
{
    [Id(0)]
    public string Name { get; set; } = string.Empty;
    [Id(1)]
    public string Description { get; set; } = string.Empty;
    [Id(2)]
    public List<string> Steps { get; set; } = new();
    [Id(3)]
    public Dictionary<string, object> Settings { get; set; } = new();
    [Id(4)]
    public bool IsActive { get; set; } = true;
    [Id(5)]
    public TimeSpan Timeout { get; set; } = TimeSpan.FromMinutes(30);
}

/// <summary>
/// Pipeline execution result
/// </summary>
[GenerateSerializer]
public class PipelineExecutionResult
{
    [Id(0)]
    public Guid ExecutionId { get; set; }
    [Id(1)]
    public string PipelineName { get; set; } = string.Empty;
    [Id(2)]
    public DateTime StartedAt { get; set; }
    [Id(3)]
    public DateTime? CompletedAt { get; set; }
    [Id(4)]
    public PipelineExecutionStatus Status { get; set; }
    [Id(5)]
    public List<string> Steps { get; set; } = new();
    [Id(6)]
    public Dictionary<string, object> Results { get; set; } = new();
    [Id(7)]
    public string? ErrorMessage { get; set; }
}

[GenerateSerializer]
public enum PipelineExecutionStatus
{
    Running,
    Completed,
    Failed,
    Cancelled
} 