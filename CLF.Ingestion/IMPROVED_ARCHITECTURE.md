# Improved CLF.Ingestion Architecture

## Overview

The CLF.Ingestion project has been enhanced with several design patterns to support multiple data sources efficiently using Orleans timers, reminders, and schedulers. The architecture now provides better reliability, scalability, and maintainability.

## Design Patterns Implemented

### 1. Template Method Pattern
- **BaseIngestionGrain**: Provides common functionality while allowing specialization
- **ResilientDataSourceAdapter**: Base class with circuit breaker and retry patterns
- **Benefits**: Code reuse, consistent behavior, easy extension

### 2. Strategy Pattern
- **IDataSourceAdapter**: Interface for different data source implementations
- **DataSourceFactory**: Creates appropriate adapters based on source type
- **Benefits**: Easy to add new data sources, runtime strategy selection

### 3. Factory Pattern
- **DataSourceFactory**: Configuration-driven creation of adapters and grains
- **Benefits**: Centralized object creation, configuration management

### 4. Registry Pattern
- **IDataSourceRegistry**: Central management of multiple data sources
- **DataSourceRegistry**: Implementation with grain lifecycle management
- **Benefits**: Centralized control, status monitoring, batch operations

### 5. Circuit Breaker Pattern
- **ResilientDataSourceAdapter**: Automatic failure detection and recovery
- **Benefits**: Improved reliability, graceful degradation, automatic recovery

### 6. Retry Pattern
- **ResilientDataSourceAdapter**: Exponential backoff retry policies
- **Benefits**: Transient failure handling, improved success rates

## Key Components

### Base Classes

#### BaseIngestionGrain
```csharp
public abstract class BaseIngestionGrain : Grain, IIngestionGrain
{
    // Common polling logic
    // Stream publishing
    // Status tracking
    // Error handling
}
```

#### ResilientDataSourceAdapter
```csharp
public abstract class ResilientDataSourceAdapter : IDataSourceAdapter
{
    // Circuit breaker implementation
    // Retry policies
    // HTTP client factory integration
    // Automatic failure recovery
}
```

### Data Source Specific Implementations

#### NASA FIRMS
- **NasaFirmsIngestionGrain**: Specialized grain for satellite fire detection
- **NasaFirmsAdapter**: Resilient adapter for NASA FIRMS API
- **Features**: Circuit breaker, retry policies, NASA-specific metrics

#### Other Data Sources
- USGS: Geological data
- GDACS: Global disaster alerts
- Twitter: Social media data
- Cassia User Reports: User-generated content

### Management Components

#### DataSourceRegistry
```csharp
public class DataSourceRegistry : Grain, IDataSourceRegistry
{
    // Central data source management
    // Grain lifecycle control
    // Status aggregation
    // Batch operations
}
```

#### DataSourceFactory
```csharp
public class DataSourceFactory
{
    // Configuration-driven adapter creation
    // Type registration
    // Validation
    // Information retrieval
}
```

## Orleans Integration

### Timer Usage
- **BaseIngestionGrain**: Uses Orleans timers for polling
- **Benefits**: Automatic cleanup, single-threaded execution

### Stream Integration
- **RawData**: Published to Orleans streams for downstream processing
- **Benefits**: Decoupled processing, scalability, fault tolerance

### Grain Lifecycle
- **Activation/Deactivation**: Proper resource management
- **State Persistence**: Automatic state management
- **Error Handling**: Graceful failure recovery

## Configuration Management

### ExternalDataSource Model
```csharp
public class ExternalDataSource
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public TimeSpan PollingInterval { get; set; }
    public Dictionary<string, string> Configuration { get; set; }
}
```

### Supported Configurations

#### NASA FIRMS
```json
{
  "ApiKey": "your-api-key",
  "Area": "global",
  "Satellite": "VIIRS_SNPP_NRT",
  "Days": "1"
}
```

## Resilience Features

### Circuit Breaker
- **Threshold**: 3 consecutive failures
- **Duration**: 2 minutes break
- **Recovery**: Automatic reset

### Retry Policy
- **Attempts**: 3 retries
- **Backoff**: Exponential (1s, 2s, 4s)
- **Conditions**: HTTP exceptions, timeouts

### Monitoring
- **Status Tracking**: Per-grain metrics
- **Error Logging**: Detailed failure information
- **Circuit State**: Real-time breaker status

## Usage Examples

### Registering a Data Source
```csharp
var registry = GrainFactory.GetGrain<IDataSourceRegistry>("default");
var source = new ExternalDataSource
{
    Id = Guid.NewGuid(),
    Name = "NASA_FIRMS_Global",
    Type = "NASA_FIRMS",
    PollingInterval = TimeSpan.FromHours(3),
    Configuration = new Dictionary<string, string>
    {
        ["ApiKey"] = "your-key",
        ["Area"] = "global"
    }
};

await registry.RegisterDataSourceAsync(source);
await registry.StartAllPollingAsync();
```

### Getting Status
```csharp
var statuses = await registry.GetAllStatusAsync();
foreach (var kvp in statuses)
{
    Console.WriteLine($"Source: {kvp.Key}, Status: {kvp.Value.IsPolling}");
}
```

### Manual Trigger
```csharp
var grain = GrainFactory.GetGrain<IIngestionGrain>("source-id");
var result = await grain.TriggerFetchAsync();
Console.WriteLine($"Processed: {result.RecordsProcessed}");
```

## Benefits

### Scalability
- **Distributed Processing**: Orleans grains across multiple silos
- **Stream Processing**: Asynchronous data flow
- **Load Balancing**: Automatic grain distribution

### Reliability
- **Circuit Breaker**: Prevents cascade failures
- **Retry Policies**: Handles transient failures
- **Graceful Degradation**: Continues operation during partial failures

### Maintainability
- **Factory Pattern**: Easy to add new data sources
- **Registry Pattern**: Centralized management
- **Template Method**: Consistent behavior across sources

### Monitoring
- **Rich Metrics**: Per-source status tracking
- **Error Tracking**: Detailed failure information
- **Circuit State**: Real-time health monitoring

## Future Enhancements

### Planned Features
1. **Reminder Integration**: Persistent scheduling across activations
2. **Priority Queues**: Frequency-based scheduling
3. **Data Validation**: Schema validation for incoming data
4. **Rate Limiting**: API rate limit management
5. **Caching**: Response caching for frequently accessed data

### Extensibility
- **Plugin Architecture**: Dynamic adapter loading
- **Configuration Hot-Reload**: Runtime configuration updates
- **Custom Metrics**: Source-specific monitoring
- **Webhook Support**: Real-time data ingestion

## Conclusion

The improved architecture provides a robust foundation for multi-source data ingestion with:
- **Reliability**: Circuit breakers and retry policies
- **Scalability**: Orleans distributed processing
- **Maintainability**: Clear patterns and abstractions
- **Extensibility**: Easy addition of new data sources

This design supports the current NASA FIRMS integration and provides a clear path for adding additional data sources like USGS, GDACS, and others. 