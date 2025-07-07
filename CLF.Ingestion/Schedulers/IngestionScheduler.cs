using Orleans;
using System.Threading.Tasks;
using CLF.Ingestion.Grains.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Schedulers;

public class IngestionScheduler : Grain
{
    private ILogger _logger;
    private IDisposable? _timer;

    public IngestionScheduler(ILogger logger)
    {
        _logger = logger;
    }

    public override async Task OnActivateAsync(CancellationToken cancellationToken)
    {
        // Register a timer to trigger polling every 5 minutes
        _timer = RegisterTimer(
            ProcessScheduledPolling, 
            null, 
            TimeSpan.FromMinutes(1), 
            TimeSpan.FromMinutes(5));
        
        await base.OnActivateAsync(cancellationToken);
    }

    public override async Task OnDeactivateAsync(DeactivationReason reason, CancellationToken cancellationToken)
    {
        _timer?.Dispose();
        await base.OnDeactivateAsync(reason, cancellationToken);
    }

    private async Task ProcessScheduledPolling(object? state)
    {
        _logger.LogInformation("IngestionScheduler processing scheduled polling");
        // In a real implementation, enumerate all active ingestion grains and trigger polling
        // Example:
        // var grain = GrainFactory.GetGrain<IIngestionGrain>("NASA_FIRMS");
        // await grain.TriggerFetchAsync();
        await Task.CompletedTask;
    }
} 