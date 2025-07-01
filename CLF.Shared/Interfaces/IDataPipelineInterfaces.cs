using CLF.Shared.Models;

namespace CLF.Shared.Interfaces;

/// <summary>
/// Interface for external data source services
/// </summary>
public interface IExternalDataSourceService
{
    Task<RawData> ExtractDataAsync(ExternalDataSource source);
    Task<bool> ValidateConnectionAsync(ExternalDataSource source);
    Task<Dictionary<string, object>> GetMetadataAsync(ExternalDataSource source);
}

/// <summary>
/// Interface for data ingestion services
/// </summary>
public interface IDataIngestionService
{
    Task<RawData> IngestDataAsync(ExternalDataSource source);
    Task<bool> ValidateRawDataAsync(RawData rawData);
    Task<RawData> StoreRawDataAsync(RawData rawData);
    Task TriggerETLAsync(Guid rawDataId);
}

/// <summary>
/// Interface for ETL processing services
/// </summary>
public interface IETLService
{
    Task<CleanData> ExtractAsync(Guid rawDataId);
    Task<CleanData> TransformAsync(RawData rawData);
    Task<bool> LoadAsync(CleanData cleanData);
    Task<CleanData> ProcessPipelineAsync(Guid rawDataId);
}

/// <summary>
/// Interface for data storage services
/// </summary>
public interface IDataStorageService
{
    Task<bool> StoreEventDataAsync(EventData eventData);
    Task<bool> StoreTimeSeriesDataAsync(TimeSeriesData timeSeriesData);
    Task<bool> StoreGeoDataAsync(GeoData geoData);
    Task<bool> IndexDataAsync(Guid dataId, string dataType);
}

/// <summary>
/// Interface for event store
/// </summary>
public interface IEventStore
{
    Task<bool> AppendEventAsync(EventData eventData);
    Task<List<EventData>> GetEventsAsync(string aggregateId, long fromVersion = 0);
    Task<EventData?> GetLastEventAsync(string aggregateId);
    Task<long> GetCurrentVersionAsync(string aggregateId);
}

/// <summary>
/// Interface for time series storage
/// </summary>
public interface ITimeSeriesStore
{
    Task<bool> StoreDataPointAsync(TimeSeriesData dataPoint);
    Task<List<TimeSeriesData>> GetDataPointsAsync(string metricName, DateTime from, DateTime to);
    Task<List<TimeSeriesData>> GetDataPointsByTagsAsync(Dictionary<string, string> tags, DateTime from, DateTime to);
    Task<double> GetAggregatedValueAsync(string metricName, DateTime from, DateTime to, string aggregation);
}

/// <summary>
/// Interface for geospatial storage
/// </summary>
public interface IGeoStore
{
    Task<bool> StoreGeoDataAsync(GeoData geoData);
    Task<List<GeoData>> GetGeoDataInRadiusAsync(double latitude, double longitude, double radiusKm);
    Task<List<GeoData>> GetGeoDataInBoundingBoxAsync(double minLat, double maxLat, double minLon, double maxLon);
    Task<GeoData?> GetGeoDataByIdAsync(Guid id);
}

/// <summary>
/// Interface for indexing service
/// </summary>
public interface IIndexingService
{
    Task<bool> IndexDataAsync(Guid dataId, string dataType, Dictionary<string, object> data);
    Task<List<Guid>> SearchAsync(string query, string dataType, Dictionary<string, object> filters);
    Task<bool> RemoveFromIndexAsync(Guid dataId);
    Task<bool> UpdateIndexAsync(Guid dataId, Dictionary<string, object> data);
}

/// <summary>
/// Interface for message bus/queue
/// </summary>
public interface IMessageBus
{
    Task PublishAsync<T>(string topic, T message) where T : class;
    Task SubscribeAsync<T>(string topic, Func<T, Task> handler) where T : class;
    Task UnsubscribeAsync<T>(string topic) where T : class;
}

/// <summary>
/// Interface for pipeline orchestration
/// </summary>
public interface IPipelineOrchestrator
{
    Task<PipelineExecutionResult> ExecutePipelineAsync(string pipelineName, Dictionary<string, object> parameters);
    Task<PipelineExecutionResult> GetExecutionStatusAsync(Guid executionId);
    Task<bool> CancelExecutionAsync(Guid executionId);
    Task<List<PipelineExecutionResult>> GetExecutionsAsync(string pipelineName, DateTime from, DateTime to);
}

/// <summary>
/// Interface for data validation
/// </summary>
public interface IDataValidator
{
    Task<Dictionary<string, object>> ValidateAsync(RawData rawData);
    Task<bool> IsValidAsync(RawData rawData);
    Task<List<string>> GetValidationErrorsAsync(RawData rawData);
}

/// <summary>
/// Interface for data transformation
/// </summary>
public interface IDataTransformer
{
    Task<CleanData> TransformAsync(RawData rawData);
    Task<Dictionary<string, object>> ExtractEventsAsync(CleanData cleanData);
    Task<List<TimeSeriesData>> ExtractTimeSeriesAsync(CleanData cleanData);
    Task<List<GeoData>> ExtractGeoDataAsync(CleanData cleanData);
} 