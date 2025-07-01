using Orleans;
using System.Threading.Tasks;
using CLF.Ingestion.Grains.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLF.Ingestion.Schedulers;

public class IngestionScheduler : Grain, IRemindable
{
    private ILogger<IngestionScheduler> _logger;

    public IngestionScheduler(ILogger<IngestionScheduler> logger)
    {
        _logger = logger;
    }

    public override async Task OnActivateAsync()
    {
        // Register a reminder to trigger polling every 5 minutes
        await RegisterOrUpdateReminder("IngestionPollReminder", TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5));
        await base.OnActivateAsync();
    }

    public async Task ReceiveReminder(string reminderName, TickStatus status)
    {
        _logger.LogInformation("IngestionScheduler received reminder: {ReminderName}", reminderName);
        // In a real implementation, enumerate all active ingestion grains and trigger polling
        // Example:
        // var grain = GrainFactory.GetGrain<IIngestionGrain>("NASA_FIRMS");
        // await grain.TriggerFetchAsync();
        await Task.CompletedTask;
    }
} 