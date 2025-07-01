using System.Text.Json.Serialization;

namespace CLF.Shared.Models;

/// <summary>
/// Base model for all data pipeline entities
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// External data source configuration
/// </summary>
public class ExternalDataSource : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // API, Database, File, etc.
    public string ConnectionString { get; set; } = string.Empty;
    public Dictionary<string, string> Configuration { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public TimeSpan PollingInterval { get; set; } = TimeSpan.FromMinutes(5);
}

/// <summary>
/// Raw data from external sources (staging)
/// </summary>
public class RawData : BaseEntity
{
    public Guid SourceId { get; set; }
    public string DataType { get; set; } = string.Empty;
    public string RawContent { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
    public DataIngestionStatus Status { get; set; } = DataIngestionStatus.Pending;
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; } = 0;
}

/// <summary>
/// Clean, processed data
/// </summary>
public class CleanData : BaseEntity
{
    public Guid RawDataId { get; set; }
    public string DataType { get; set; } = string.Empty;
    public Dictionary<string, object> ProcessedData { get; set; } = new();
    public DataProcessingStatus Status { get; set; } = DataProcessingStatus.Pending;
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> ValidationResults { get; set; } = new();
}

/// <summary>
/// Event sourcing model
/// </summary>
public class EventData : BaseEntity
{
    public string EventType { get; set; } = string.Empty;
    public string AggregateId { get; set; } = string.Empty;
    public long Version { get; set; }
    public Dictionary<string, object> EventData { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Time series data model
/// </summary>
public class TimeSeriesData : BaseEntity
{
    public string MetricName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public double Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public Dictionary<string, string> Tags { get; set; } = new();
    public string? Source { get; set; }
}

/// <summary>
/// Geospatial data model
/// </summary>
public class GeoData : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Address { get; set; }
    public Dictionary<string, object> Properties { get; set; } = new();
    public string? GeoJson { get; set; }
    public string? GeometryType { get; set; }
}

/// <summary>
/// Pipeline processing status
/// </summary>
public enum DataIngestionStatus
{
    Pending,
    InProgress,
    Completed,
    Failed,
    Retrying
}

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
public class PipelineConfiguration
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Steps { get; set; } = new();
    public Dictionary<string, object> Settings { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public TimeSpan Timeout { get; set; } = TimeSpan.FromMinutes(30);
}

/// <summary>
/// Pipeline execution result
/// </summary>
public class PipelineExecutionResult
{
    public Guid ExecutionId { get; set; }
    public string PipelineName { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public PipelineExecutionStatus Status { get; set; }
    public List<string> Steps { get; set; } = new();
    public Dictionary<string, object> Results { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

public enum PipelineExecutionStatus
{
    Running,
    Completed,
    Failed,
    Cancelled
} 