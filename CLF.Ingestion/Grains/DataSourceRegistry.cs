using Orleans;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Grains;

/// <summary>
/// Central registry for managing multiple data sources and their ingestion grains
/// </summary>
public class DataSourceRegistry : Grain, IDataSourceRegistry
{
    private readonly Dictionary<string, ExternalDataSource> _sources = new();
    private readonly Dictionary<string, IIngestionGrain> _ingestionGrains = new();
    private readonly ILogger<DataSourceRegistry> _logger;

    public DataSourceRegistry(ILogger<DataSourceRegistry> logger)
    {
        _logger = logger;
    }

    public async Task<bool> RegisterDataSourceAsync(ExternalDataSource source)
    {
        try
        {
            _logger.LogInformation("Registering data source: {SourceName} ({SourceId})", source.Name, source.Id);

            var sourceId = source.Id.ToString();
            
            // Store the data source
            _sources[sourceId] = source;

            // Create and initialize the appropriate grain
            var grain = GetIngestionGrainForSource(source);
            await grain.InitializeAsync(source);
            
            // Store the grain reference
            _ingestionGrains[sourceId] = grain;

            _logger.LogInformation("Successfully registered data source: {SourceName}", source.Name);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering data source: {SourceName}", source.Name);
            return false;
        }
    }

    public async Task<bool> UnregisterDataSourceAsync(string sourceId)
    {
        try
        {
            _logger.LogInformation("Unregistering data source: {SourceId}", sourceId);

            if (_ingestionGrains.TryGetValue(sourceId, out var grain))
            {
                await grain.StopPollingAsync();
                _ingestionGrains.Remove(sourceId);
            }

            _sources.Remove(sourceId);

            _logger.LogInformation("Successfully unregistered data source: {SourceId}", sourceId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unregistering data source: {SourceId}", sourceId);
            return false;
        }
    }

    public Task<List<ExternalDataSource>> GetActiveDataSourcesAsync()
    {
        return Task.FromResult(_sources.Values.ToList());
    }

    public Task<ExternalDataSource?> GetDataSourceAsync(string sourceId)
    {
        _sources.TryGetValue(sourceId, out var source);
        return Task.FromResult(source);
    }

    public Task<IIngestionGrain?> GetIngestionGrainAsync(string sourceId)
    {
        _ingestionGrains.TryGetValue(sourceId, out var grain);
        return Task.FromResult(grain);
    }

    public async Task StartAllPollingAsync()
    {
        _logger.LogInformation("Starting polling for all registered data sources");

        foreach (var kvp in _ingestionGrains)
        {
            try
            {
                await kvp.Value.StartPollingAsync();
                _logger.LogInformation("Started polling for data source: {SourceId}", kvp.Key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting polling for data source: {SourceId}", kvp.Key);
            }
        }
    }

    public async Task StopAllPollingAsync()
    {
        _logger.LogInformation("Stopping polling for all registered data sources");

        foreach (var kvp in _ingestionGrains)
        {
            try
            {
                await kvp.Value.StopPollingAsync();
                _logger.LogInformation("Stopped polling for data source: {SourceId}", kvp.Key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping polling for data source: {SourceId}", kvp.Key);
            }
        }
    }

    public async Task<Dictionary<string, IngestionGrainStatus>> GetAllStatusAsync()
    {
        var statuses = new Dictionary<string, IngestionGrainStatus>();

        foreach (var kvp in _ingestionGrains)
        {
            try
            {
                var status = await kvp.Value.GetStatusAsync();
                statuses[kvp.Key] = status;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting status for data source: {SourceId}", kvp.Key);
                statuses[kvp.Key] = new IngestionGrainStatus
                {
                    SourceName = "Unknown",
                    SourceType = "Unknown",
                    LastError = ex.Message
                };
            }
        }

        return statuses;
    }

    public async Task<bool> UpdateDataSourceAsync(ExternalDataSource source)
    {
        try
        {
            var sourceId = source.Id.ToString();
            
            if (!_sources.ContainsKey(sourceId))
            {
                _logger.LogWarning("Data source not found for update: {SourceId}", sourceId);
                return false;
            }

            _logger.LogInformation("Updating data source: {SourceName} ({SourceId})", source.Name, sourceId);

            // Update the stored data source
            _sources[sourceId] = source;

            // Reinitialize the grain with new configuration
            if (_ingestionGrains.TryGetValue(sourceId, out var grain))
            {
                await grain.StopPollingAsync();
                await grain.InitializeAsync(source);
                await grain.StartPollingAsync();
            }

            _logger.LogInformation("Successfully updated data source: {SourceName}", source.Name);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating data source: {SourceName}", source.Name);
            return false;
        }
    }

    private IIngestionGrain GetIngestionGrainForSource(ExternalDataSource source)
    {
        return source.Type switch
        {
            "NASA_FIRMS" => GrainFactory.GetGrain<INasaFirmsIngestionGrain>(source.Id.ToString()),
            "USGS" => GrainFactory.GetGrain<IUSGSIngestionGrain>(source.Id.ToString()),
            "GDACS" => GrainFactory.GetGrain<IGDACSIngestionGrain>(source.Id.ToString()),
            "TWITTER" => GrainFactory.GetGrain<ITwitterIngestionGrain>(source.Id.ToString()),
            "CASSIA_USER_REPORT" => GrainFactory.GetGrain<ICassiaUserReportIngestionGrain>(source.Id.ToString()),
            _ => throw new NotSupportedException($"Unsupported source type: {source.Type}")
        };
    }
} 