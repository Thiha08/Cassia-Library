using Orleans;
using Orleans.Runtime;
using CLF.Server.Models;

namespace CLF.Server.Grains;

public class TownshipFireGrain : Grain, ITownshipFireGrain
{
    private readonly IPersistentState<TownshipFireState> _state;
    private readonly ILogger<TownshipFireGrain> _logger;

    public TownshipFireGrain(
        [PersistentState("township-fire", "fire-store")] IPersistentState<TownshipFireState> state,
        ILogger<TownshipFireGrain> logger)
    {
        _state = state;
        _logger = logger;
    }

    public override Task OnActivateAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("TownshipFireGrain activated for township: {Township}", this.GetPrimaryKeyString());
        return base.OnActivateAsync(cancellationToken);
    }

    public async Task<List<FireEvent>> GetFireEventsAsync(FireEventQuery? query = null)
    {
        var events = _state.State.FireEvents ?? new List<FireEvent>();

        if (query == null)
            return events;

        // Apply filters
        var filteredEvents = events.AsEnumerable();

        // Filter by date range
        if (query.FromDate.HasValue)
        {
            filteredEvents = filteredEvents.Where(e => e.Properties.Timestamp >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            filteredEvents = filteredEvents.Where(e => e.Properties.Timestamp <= query.ToDate.Value);
        }

        // Filter by status
        if (!string.IsNullOrEmpty(query.Status))
        {
            filteredEvents = filteredEvents.Where(e => e.Properties.Status.Equals(query.Status, StringComparison.OrdinalIgnoreCase));
        }

        // Filter by intensity range
        if (query.MinIntensity.HasValue)
        {
            filteredEvents = filteredEvents.Where(e => e.Properties.Intensity >= query.MinIntensity.Value);
        }

        if (query.MaxIntensity.HasValue)
        {
            filteredEvents = filteredEvents.Where(e => e.Properties.Intensity <= query.MaxIntensity.Value);
        }

        // Filter by bounding box
        if (query.Bbox != null && query.Bbox.Length == 4)
        {
            var minLon = query.Bbox[0];
            var minLat = query.Bbox[1];
            var maxLon = query.Bbox[2];
            var maxLat = query.Bbox[3];
            
            filteredEvents = filteredEvents.Where(e => 
                e.Geometry.Coordinates[0] >= minLon && 
                e.Geometry.Coordinates[0] <= maxLon &&
                e.Geometry.Coordinates[1] >= minLat && 
                e.Geometry.Coordinates[1] <= maxLat);
        }

        return filteredEvents.ToList();
    }

    public async Task<TownshipFireSummary> GetTownshipSummaryAsync()
    {
        var events = _state.State.FireEvents ?? new List<FireEvent>();
        var today = DateTime.Today;

        var todayEvents = events.Where(e => e.Properties.Timestamp.Date == today).ToList();
        var lastEvent = events.OrderByDescending(e => e.Properties.Timestamp).FirstOrDefault();

        return new TownshipFireSummary
        {
            Township = this.GetPrimaryKeyString(),
            EventCount = todayEvents.Count,
            LastEventTime = lastEvent?.Properties.Timestamp ?? DateTime.MinValue,
            AverageIntensity = todayEvents.Any() ? todayEvents.Average(e => e.Properties.Intensity) : 0,
            MostSevereStatus = todayEvents.Any() ? todayEvents.OrderByDescending(e => e.Properties.Intensity).First().Properties.Status : string.Empty
        };
    }

    public async Task<bool> HasEventsTodayAsync()
    {
        var events = _state.State.FireEvents ?? new List<FireEvent>();
        var today = DateTime.Today;
        return events.Any(e => e.Properties.Timestamp.Date == today);
    }

    public async Task AddFireEventAsync(FireEvent fireEvent)
    {
        if (_state.State.FireEvents == null)
            _state.State.FireEvents = new List<FireEvent>();

        // Ensure the event has the correct township
        fireEvent.Township = this.GetPrimaryKeyString();
        
        // Check if event already exists
        var existingIndex = _state.State.FireEvents.FindIndex(e => e.Id == fireEvent.Id);
        if (existingIndex >= 0)
        {
            _state.State.FireEvents[existingIndex] = fireEvent;
        }
        else
        {
            _state.State.FireEvents.Add(fireEvent);
        }

        await _state.WriteStateAsync();
        _logger.LogInformation("Added/Updated fire event {EventId} for township {Township}", fireEvent.Id, this.GetPrimaryKeyString());
    }

    public async Task UpdateFireEventAsync(FireEvent fireEvent)
    {
        if (_state.State.FireEvents == null)
            return;

        var existingIndex = _state.State.FireEvents.FindIndex(e => e.Id == fireEvent.Id);
        if (existingIndex >= 0)
        {
            _state.State.FireEvents[existingIndex] = fireEvent;
            await _state.WriteStateAsync();
            _logger.LogInformation("Updated fire event {EventId} for township {Township}", fireEvent.Id, this.GetPrimaryKeyString());
        }
    }

    public async Task RemoveFireEventAsync(string eventId)
    {
        if (_state.State.FireEvents == null)
            return;

        var eventToRemove = _state.State.FireEvents.FirstOrDefault(e => e.Id == eventId);
        if (eventToRemove != null)
        {
            _state.State.FireEvents.Remove(eventToRemove);
            await _state.WriteStateAsync();
            _logger.LogInformation("Removed fire event {EventId} from township {Township}", eventId, this.GetPrimaryKeyString());
        }
    }

    public async Task<int> GetEventCountAsync()
    {
        return _state.State.FireEvents?.Count ?? 0;
    }

    public async Task<DateTime> GetLastEventTimeAsync()
    {
        var events = _state.State.FireEvents ?? new List<FireEvent>();
        var lastEvent = events.OrderByDescending(e => e.Properties.Timestamp).FirstOrDefault();
        return lastEvent?.Properties.Timestamp ?? DateTime.MinValue;
    }

    public async Task ClearEventsAsync()
    {
        _state.State.FireEvents?.Clear();
        await _state.WriteStateAsync();
        _logger.LogInformation("Cleared all fire events for township {Township}", this.GetPrimaryKeyString());
    }
}

public class TownshipFireState
{
    public List<FireEvent> FireEvents { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
} 