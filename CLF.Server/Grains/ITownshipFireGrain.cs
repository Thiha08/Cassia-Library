using Orleans;
using CLF.Server.Models;

namespace CLF.Server.Grains;

public interface ITownshipFireGrain : IGrainWithStringKey
{
    Task<List<FireEvent>> GetFireEventsAsync(FireEventQuery? query = null);
    Task<TownshipFireSummary> GetTownshipSummaryAsync();
    Task<bool> HasEventsTodayAsync();
    Task AddFireEventAsync(FireEvent fireEvent);
    Task UpdateFireEventAsync(FireEvent fireEvent);
    Task RemoveFireEventAsync(string eventId);
    Task<int> GetEventCountAsync();
    Task<DateTime> GetLastEventTimeAsync();
    Task ClearEventsAsync();
} 