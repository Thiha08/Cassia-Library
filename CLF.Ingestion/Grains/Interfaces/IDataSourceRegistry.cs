using Orleans;
using CLF.Shared.Models;
using CLF.Ingestion.Grains.Interfaces;

namespace CLF.Ingestion.Grains.Interfaces;

/// <summary>
/// Registry for managing multiple data sources centrally
/// </summary>
public interface IDataSourceRegistry : IGrainWithStringKey
{
    /// <summary>
    /// Register a new data source
    /// </summary>
    Task<bool> RegisterDataSourceAsync(ExternalDataSource source);

    /// <summary>
    /// Unregister a data source
    /// </summary>
    Task<bool> UnregisterDataSourceAsync(string sourceId);

    /// <summary>
    /// Get all active data sources
    /// </summary>
    Task<List<ExternalDataSource>> GetActiveDataSourcesAsync();

    /// <summary>
    /// Get a specific data source
    /// </summary>
    Task<ExternalDataSource?> GetDataSourceAsync(string sourceId);

    /// <summary>
    /// Get the ingestion grain for a specific data source
    /// </summary>
    Task<IIngestionGrain?> GetIngestionGrainAsync(string sourceId);

    /// <summary>
    /// Start polling for all registered data sources
    /// </summary>
    Task StartAllPollingAsync();

    /// <summary>
    /// Stop polling for all registered data sources
    /// </summary>
    Task StopAllPollingAsync();

    /// <summary>
    /// Get status of all ingestion grains
    /// </summary>
    Task<Dictionary<string, IngestionGrainStatus>> GetAllStatusAsync();

    /// <summary>
    /// Update data source configuration
    /// </summary>
    Task<bool> UpdateDataSourceAsync(ExternalDataSource source);
} 