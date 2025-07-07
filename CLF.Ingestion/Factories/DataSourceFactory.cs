using CLF.Ingestion.Adapters;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Factories;

/// <summary>
/// Factory for creating data source adapters and grains based on configuration
/// </summary>
public class DataSourceFactory : IDataSourceFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly Dictionary<string, Type> _adapterTypes = new();
    private readonly Dictionary<string, Type> _grainTypes = new();
    private readonly ILogger _logger;

    public DataSourceFactory(IServiceProvider serviceProvider, ILogger logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        RegisterAdapters();
        RegisterGrains();
    }

    private void RegisterAdapters()
    {
        _adapterTypes["NASA_FIRMS"] = typeof(NasaFirmsAdapter);
        _adapterTypes["USGS"] = typeof(USGSAdapter);
        _adapterTypes["GDACS"] = typeof(GDACSAdapter);
        _adapterTypes["TWITTER"] = typeof(TwitterAdapter);
        _adapterTypes["CASSIA_USER_REPORT"] = typeof(CassiaUserReportAdapter);
    }

    private void RegisterGrains()
    {
        _grainTypes["NASA_FIRMS"] = typeof(INasaFirmsIngestionGrain);
        _grainTypes["USGS"] = typeof(IUSGSIngestionGrain);
        _grainTypes["GDACS"] = typeof(IGDACSIngestionGrain);
        _grainTypes["TWITTER"] = typeof(ITwitterIngestionGrain);
        _grainTypes["CASSIA_USER_REPORT"] = typeof(ICassiaUserReportIngestionGrain);
    }

    /// <summary>
    /// Create an adapter for the specified data source
    /// </summary>
    public IDataSourceAdapter CreateAdapter(ExternalDataSource source)
    {
        return CreateAdapter(source.Type);
    }

    /// <summary>
    /// Create an ingestion grain for the specified data source
    /// </summary>
    public IIngestionGrain CreateIngestionGrain(ExternalDataSource source)
    {
        // In a real implementation, this would use GrainFactory
        // For now, we'll throw an exception as this should be called from within a grain context
        throw new InvalidOperationException("CreateIngestionGrain should be called from within a grain context");
    }

    /// <summary>
    /// Get all available adapter types
    /// </summary>
    public IEnumerable<string> GetAvailableAdapterTypes()
    {
        return _adapterTypes.Keys;
    }

    /// <summary>
    /// Validate that a data source can be created
    /// </summary>
    public bool ValidateDataSource(ExternalDataSource source)
    {
        return IsSourceTypeSupported(source.Type);
    }

    /// <summary>
    /// Create an adapter for the specified source type
    /// </summary>
    public IDataSourceAdapter CreateAdapter(string sourceType)
    {
        if (!_adapterTypes.TryGetValue(sourceType, out var adapterType))
        {
            throw new NotSupportedException($"Unsupported source type: {sourceType}");
        }

        try
        {
            return (IDataSourceAdapter)ActivatorUtilities.CreateInstance(_serviceProvider, adapterType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating adapter for source type: {SourceType}", sourceType);
            throw;
        }
    }

    /// <summary>
    /// Get the grain type for the specified source type
    /// </summary>
    public Type GetGrainType(string sourceType)
    {
        if (!_grainTypes.TryGetValue(sourceType, out var grainType))
        {
            throw new NotSupportedException($"Unsupported source type: {sourceType}");
        }

        return grainType;
    }

    /// <summary>
    /// Validate if a source type is supported
    /// </summary>
    public bool IsSourceTypeSupported(string sourceType)
    {
        return _adapterTypes.ContainsKey(sourceType) && _grainTypes.ContainsKey(sourceType);
    }

    /// <summary>
    /// Get all supported source types
    /// </summary>
    public IEnumerable<string> GetSupportedSourceTypes()
    {
        return _adapterTypes.Keys.Intersect(_grainTypes.Keys);
    }

    /// <summary>
    /// Get adapter information for a source type
    /// </summary>
    public AdapterInfo GetAdapterInfo(string sourceType)
    {
        if (!_adapterTypes.TryGetValue(sourceType, out var adapterType))
        {
            throw new NotSupportedException($"Unsupported source type: {sourceType}");
        }

        return new AdapterInfo
        {
            SourceType = sourceType,
            AdapterType = adapterType.Name,
            GrainType = _grainTypes[sourceType].Name,
            IsSupported = true
        };
    }
}

/// <summary>
/// Information about a data source adapter
/// </summary>
public class AdapterInfo
{
    public string SourceType { get; set; } = string.Empty;
    public string AdapterType { get; set; } = string.Empty;
    public string GrainType { get; set; } = string.Empty;
    public bool IsSupported { get; set; }
} 