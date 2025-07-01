using Microsoft.AspNetCore.SignalR;
using CLF.Server.Models;
using Orleans;

namespace CLF.Server.Hubs;

public class FireHub : Hub
{
    private readonly IClusterClient _clusterClient;
    private readonly ILogger<FireHub> _logger;

    public FireHub(IClusterClient clusterClient, ILogger<FireHub> logger)
    {
        _clusterClient = clusterClient;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a geographic group for fire events
    /// </summary>
    /// <param name="groupName">Group name (e.g., "fire-region-123-456-789-012")</param>
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Client {ConnectionId} joined group: {GroupName}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Leave a geographic group
    /// </summary>
    /// <param name="groupName">Group name</param>
    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Client {ConnectionId} left group: {GroupName}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Join the global fire monitoring group
    /// </summary>
    public async Task JoinGlobalFireMonitoring()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "fire-global");
        _logger.LogInformation("Client {ConnectionId} joined global fire monitoring", Context.ConnectionId);
    }

    /// <summary>
    /// Leave the global fire monitoring group
    /// </summary>
    public async Task LeaveGlobalFireMonitoring()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "fire-global");
        _logger.LogInformation("Client {ConnectionId} left global fire monitoring", Context.ConnectionId);
    }

    /// <summary>
    /// Get current fire events for a specific area
    /// </summary>
    /// <param name="bbox">Bounding box coordinates [minLon, minLat, maxLon, maxLat]</param>
    /// <returns>Current fire events in the area</returns>
    public async Task<List<FireEvent>> GetCurrentFireData(double[]? bbox = null)
    {
        try
        {
            _logger.LogInformation("Getting current fire data for bbox: {Bbox}", bbox != null ? string.Join(",", bbox) : "null");

            // For now, return mock data
            // In a real implementation, you would query the appropriate township grains
            var mockEvents = GenerateMockFireEvents(bbox);
            return mockEvents;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current fire data");
            return new List<FireEvent>();
        }
    }

    /// <summary>
    /// Get current fire events for specific parameters
    /// </summary>
    /// <param name="params">Query parameters</param>
    /// <returns>Current fire events</returns>
    public async Task<List<FireEvent>> GetCurrentEvents(FireEventQuery? @params = null)
    {
        try
        {
            _logger.LogInformation("Getting current events with params: {@Params}", @params);

            // For now, return mock data
            var mockEvents = GenerateMockFireEvents(@params?.Bbox);
            return mockEvents;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current events");
            return new List<FireEvent>();
        }
    }

    /// <summary>
    /// Broadcast a fire event to all connected clients
    /// </summary>
    /// <param name="fireEvent">Fire event to broadcast</param>
    public async Task BroadcastFireEvent(FireEvent fireEvent)
    {
        try
        {
            _logger.LogInformation("Broadcasting fire event: {EventId}", fireEvent.Id);
            await Clients.All.SendAsync("FireEventReceived", fireEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting fire event");
        }
    }

    /// <summary>
    /// Broadcast a fire event to a specific group
    /// </summary>
    /// <param name="groupName">Group name</param>
    /// <param name="fireEvent">Fire event to broadcast</param>
    public async Task BroadcastFireEventToGroup(string groupName, FireEvent fireEvent)
    {
        try
        {
            _logger.LogInformation("Broadcasting fire event {EventId} to group: {GroupName}", fireEvent.Id, groupName);
            await Clients.Group(groupName).SendAsync("FireEventReceived", fireEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting fire event to group");
        }
    }

    /// <summary>
    /// Broadcast a batch of fire events
    /// </summary>
    /// <param name="fireEvents">Batch of fire events</param>
    public async Task BroadcastFireBatch(List<FireEvent> fireEvents)
    {
        try
        {
            _logger.LogInformation("Broadcasting fire batch with {Count} events", fireEvents.Count);
            await Clients.All.SendAsync("FireBatch", fireEvents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting fire batch");
        }
    }

    private List<FireEvent> GenerateMockFireEvents(double[]? bbox = null)
    {
        var events = new List<FireEvent>();
        var random = new Random();
        
        // Generate 3-8 mock events
        var eventCount = random.Next(3, 9);
        
        for (int i = 0; i < eventCount; i++)
        {
            double lon, lat;
            
            if (bbox != null && bbox.Length == 4)
            {
                lon = random.NextDouble() * (bbox[2] - bbox[0]) + bbox[0];
                lat = random.NextDouble() * (bbox[3] - bbox[1]) + bbox[1];
            }
            else
            {
                // Default coordinates if no bbox provided
                lon = random.NextDouble() * 360 - 180;
                lat = random.NextDouble() * 180 - 90;
            }
            
            var eventTime = DateTime.UtcNow.AddMinutes(-random.Next(1, 60));
            var intensity = random.NextDouble() * 10;
            
            var status = random.Next(3) switch
            {
                0 => "active",
                1 => "contained",
                _ => "resolved"
            };
            
            events.Add(new FireEvent
            {
                Id = $"fire-{Guid.NewGuid():N}",
                Township = $"Township{random.Next(1, 11)}",
                Geometry = new Geometry
                {
                    Coordinates = new double[] { lon, lat }
                },
                Properties = new FireEventProperties
                {
                    Name = $"Real-time Fire Event {i + 1}",
                    Description = $"Real-time fire event detected via satellite",
                    Timestamp = eventTime,
                    Intensity = intensity,
                    Status = status,
                    Temperature = random.NextDouble() * 40 + 20,
                    Humidity = random.NextDouble() * 100,
                    WindSpeed = random.NextDouble() * 30,
                    WindDirection = "NW",
                    WeatherCondition = "Clear",
                    FireType = "Wildfire",
                    AreaAffected = random.NextDouble() * 1000,
                    Severity = intensity > 7 ? "High" : intensity > 4 ? "Medium" : "Low",
                    Source = "Satellite",
                    Confidence = "High",
                    Satellite = "GOES-16",
                    Algorithm = "VIIRS",
                    Brightness = random.NextDouble() * 500 + 300,
                    Frp = random.NextDouble() * 100 + 50,
                    DayNight = random.Next(2) == 0 ? "D" : "N"
                }
            });
        }
        
        return events;
    }
} 