using CLF.Shared.Models;
using CLF.Ingestion.Adapters;
using CLF.Ingestion.Grains.Interfaces;

namespace CLF.Ingestion.Factories;

/// <summary>
/// Factory interface for creating data source adapters and grains
/// </summary>
public interface IDataSourceFactory
{
    /// <summary>
    /// Create an adapter for the specified data source
    /// </summary>
    IDataSourceAdapter CreateAdapter(ExternalDataSource source);
    
    /// <summary>
    /// Create an ingestion grain for the specified data source
    /// </summary>
    IIngestionGrain CreateIngestionGrain(ExternalDataSource source);
    
    /// <summary>
    /// Get all available adapter types
    /// </summary>
    IEnumerable<string> GetAvailableAdapterTypes();
    
    /// <summary>
    /// Validate that a data source can be created
    /// </summary>
    bool ValidateDataSource(ExternalDataSource source);
    
    /// <summary>
    /// Create an adapter for the specified source type
    /// </summary>
    IDataSourceAdapter CreateAdapter(string sourceType);
    
    /// <summary>
    /// Get the grain type for the specified source type
    /// </summary>
    Type GetGrainType(string sourceType);
    
    /// <summary>
    /// Validate if a source type is supported
    /// </summary>
    bool IsSourceTypeSupported(string sourceType);
    
    /// <summary>
    /// Get all supported source types
    /// </summary>
    IEnumerable<string> GetSupportedSourceTypes();
    
    /// <summary>
    /// Get adapter information for a source type
    /// </summary>
    AdapterInfo GetAdapterInfo(string sourceType);
} 