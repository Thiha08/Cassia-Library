using CLF.Shared.Models;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// Base interface for all data source adapters
/// </summary>
public interface IDataSourceAdapter
{
    /// <summary>
    /// Name of the data source
    /// </summary>
    string SourceName { get; }

    /// <summary>
    /// Type of the data source
    /// </summary>
    string SourceType { get; }

    /// <summary>
    /// Fetch data from the external source
    /// </summary>
    Task<List<RawData>> FetchDataAsync(ExternalDataSource source);

    /// <summary>
    /// Validate connection to the external source
    /// </summary>
    Task<bool> ValidateConnectionAsync(ExternalDataSource source);
} 