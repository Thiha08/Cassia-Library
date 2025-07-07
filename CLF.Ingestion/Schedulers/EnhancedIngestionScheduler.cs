using Orleans;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Schedulers;

/// <summary>
/// Enhanced ingestion scheduler with priority-based polling and frequency management
/// </summary>
public class EnhancedIngestionScheduler : Grain
{
    private readonly ILogger _logger;
    private readonly Dictionary<string, TimeSpan> _sourceIntervals = new();
    private readonly Dictionary<string, string> _sourceFrequencies = new();
    private IDisposable? _timer;

    public EnhancedIngestionScheduler(ILogger logger)
    {
        _logger = logger;
    }

    public override async Task OnActivateAsync(CancellationToken cancellationToken)
    {
        // Start a timer for periodic scheduling
        _timer = RegisterTimer(
            ProcessScheduledTasks, 
            null, 
            TimeSpan.FromMinutes(1), 
            TimeSpan.FromMinutes(1));
        
        await base.OnActivateAsync(cancellationToken);
        
        _logger.LogInformation("Enhanced ingestion scheduler activated");
    }

    public override async Task OnDeactivateAsync(DeactivationReason reason, CancellationToken cancellationToken)
    {
        _timer?.Dispose();
        await base.OnDeactivateAsync(reason, cancellationToken);
    }

    private async Task ProcessScheduledTasks(object? state)
    {
        _logger.LogInformation("Processing scheduled tasks");
        
        try
        {
            // Process high frequency sources (every minute)
            await ProcessSourcesByFrequency("HighFrequency");
            
            // Process medium frequency sources (every 5 minutes)
            if (DateTime.UtcNow.Minute % 5 == 0)
            {
                await ProcessSourcesByFrequency("MediumFrequency");
            }
            
            // Process low frequency sources (every 15 minutes)
            if (DateTime.UtcNow.Minute % 15 == 0)
            {
                await ProcessSourcesByFrequency("LowFrequency");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing scheduled tasks");
        }
    }

    /// <summary>
    /// Register a data source with the scheduler
    /// </summary>
    public async Task RegisterSourceAsync(ExternalDataSource source)
    {
        var sourceId = source.Id.ToString();
        _sourceIntervals[sourceId] = source.PollingInterval;
        _sourceFrequencies[sourceId] = GetFrequencyCategory(source.PollingInterval);
        
        _logger.LogInformation("Registered source {SourceName} with frequency {Frequency}", 
            source.Name, _sourceFrequencies[sourceId]);
        
        await Task.CompletedTask;
    }

    /// <summary>
    /// Unregister a data source from the scheduler
    /// </summary>
    public async Task UnregisterSourceAsync(string sourceId)
    {
        _sourceIntervals.Remove(sourceId);
        _sourceFrequencies.Remove(sourceId);
        
        _logger.LogInformation("Unregistered source: {SourceId}", sourceId);
        
        await Task.CompletedTask;
    }

    /// <summary>
    /// Process sources for a specific frequency category
    /// </summary>
    private async Task ProcessSourcesByFrequency(string frequency)
    {
        var sources = await GetSourcesForFrequency(frequency);
        
        foreach (var source in sources)
        {
            try
            {
                var grain = GrainFactory.GetGrain<IIngestionGrain>(source.Id.ToString());
                var result = await grain.TriggerFetchAsync();
                
                _logger.LogInformation("Triggered fetch for {SourceName}: {Success}, {Records} records", 
                    source.Name, result.Success, result.RecordsProcessed);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering fetch for source: {SourceName}", source.Name);
            }
        }
    }

    /// <summary>
    /// Get all sources for a specific frequency category
    /// </summary>
    private async Task<List<ExternalDataSource>> GetSourcesForFrequency(string frequency)
    {
        // In a real implementation, this would query a data store
        // For now, return empty list as this is a placeholder
        return new List<ExternalDataSource>();
    }

    /// <summary>
    /// Categorize polling interval into frequency categories
    /// </summary>
    private string GetFrequencyCategory(TimeSpan interval)
    {
        return interval.TotalMinutes switch
        {
            <= 1 => "HighFrequency",
            <= 5 => "MediumFrequency",
            _ => "LowFrequency"
        };
    }

    /// <summary>
    /// Get scheduler statistics
    /// </summary>
    public async Task<SchedulerStatistics> GetStatisticsAsync()
    {
        var stats = new SchedulerStatistics
        {
            TotalSources = _sourceIntervals.Count,
            HighFrequencySources = _sourceFrequencies.Values.Count(v => v == "HighFrequency"),
            MediumFrequencySources = _sourceFrequencies.Values.Count(v => v == "MediumFrequency"),
            LowFrequencySources = _sourceFrequencies.Values.Count(v => v == "LowFrequency"),
            LastUpdated = DateTime.UtcNow
        };
        
        return await Task.FromResult(stats);
    }
}

/// <summary>
/// Statistics for the enhanced ingestion scheduler
/// </summary>
public class SchedulerStatistics
{
    public int TotalSources { get; set; }
    public int HighFrequencySources { get; set; }
    public int MediumFrequencySources { get; set; }
    public int LowFrequencySources { get; set; }
    public DateTime LastUpdated { get; set; }
} 