using Microsoft.AspNetCore.Mvc;
using Orleans;
using CLF.Server.Models;
using CLF.Server.Grains;

namespace CLF.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FireEventsController : ControllerBase
{
    private readonly IClusterClient _clusterClient;
    private readonly ILogger<FireEventsController> _logger;

    public FireEventsController(IClusterClient clusterClient, ILogger<FireEventsController> logger)
    {
        _clusterClient = clusterClient;
        _logger = logger;
    }

    /// <summary>
    /// Get all townships that have fire events today
    /// </summary>
    /// <returns>List of townships with fire events today</returns>
    [HttpGet("townships/active-today")]
    public async Task<ActionResult<List<TownshipFireSummary>>> GetActiveTownshipsToday()
    {
        try
        {
            _logger.LogInformation("Getting townships with active fire events today");

            // For now, we'll return a hardcoded list of townships with events
            // In a real implementation, you would query all township grains
            var activeTownships = new List<TownshipFireSummary>
            {
                new TownshipFireSummary
                {
                    Township = "Springfield",
                    EventCount = 3,
                    LastEventTime = DateTime.UtcNow.AddHours(-2),
                    AverageIntensity = 7.5,
                    MostSevereStatus = "active"
                },
                new TownshipFireSummary
                {
                    Township = "Riverside",
                    EventCount = 1,
                    LastEventTime = DateTime.UtcNow.AddHours(-1),
                    AverageIntensity = 5.2,
                    MostSevereStatus = "active"
                }
            };

            return Ok(activeTownships);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active townships today");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get fire events for a single township
    /// </summary>
    /// <param name="township">Township name</param>
    /// <param name="fromDate">Start date filter (optional)</param>
    /// <param name="toDate">End date filter (optional)</param>
    /// <param name="status">Status filter (optional)</param>
    /// <param name="minIntensity">Minimum intensity filter (optional)</param>
    /// <param name="maxIntensity">Maximum intensity filter (optional)</param>
    /// <returns>Fire events for the specified township</returns>
    [HttpGet("township/{township}")]
    public async Task<ActionResult<FireEventResponse>> GetFireEventsByTownship(
        string township,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? status = null,
        [FromQuery] double? minIntensity = null,
        [FromQuery] double? maxIntensity = null)
    {
        try
        {
            _logger.LogInformation("Getting fire events for township: {Township}", township);

            var grain = _clusterClient.GetGrain<ITownshipFireGrain>(township);
            
            var query = new FireEventQuery
            {
                FromDate = fromDate,
                ToDate = toDate,
                Status = status,
                MinIntensity = minIntensity,
                MaxIntensity = maxIntensity
            };

            var events = await grain.GetFireEventsAsync(query);

            var response = new FireEventResponse
            {
                Events = events,
                TotalCount = events.Count
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting fire events for township: {Township}", township);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get fire events for multiple townships
    /// </summary>
    /// <param name="townships">Comma-separated list of township names</param>
    /// <param name="fromDate">Start date filter (optional)</param>
    /// <param name="toDate">End date filter (optional)</param>
    /// <param name="status">Status filter (optional)</param>
    /// <param name="minIntensity">Minimum intensity filter (optional)</param>
    /// <param name="maxIntensity">Maximum intensity filter (optional)</param>
    /// <returns>Fire events for the specified townships</returns>
    [HttpGet("townships")]
    public async Task<ActionResult<FireEventResponse>> GetFireEventsByMultipleTownships(
        [FromQuery] string townships,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? status = null,
        [FromQuery] double? minIntensity = null,
        [FromQuery] double? maxIntensity = null)
    {
        try
        {
            if (string.IsNullOrEmpty(townships))
            {
                return BadRequest("Townships parameter is required");
            }

            var townshipList = townships.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrEmpty(t))
                .ToArray();

            if (townshipList.Length == 0)
            {
                return BadRequest("At least one township must be specified");
            }

            _logger.LogInformation("Getting fire events for townships: {Townships}", string.Join(", ", townshipList));

            var query = new FireEventQuery
            {
                Townships = townshipList,
                FromDate = fromDate,
                ToDate = toDate,
                Status = status,
                MinIntensity = minIntensity,
                MaxIntensity = maxIntensity
            };

            var allEvents = new List<FireEvent>();

            foreach (var township in townshipList)
            {
                var grain = _clusterClient.GetGrain<ITownshipFireGrain>(township);
                var events = await grain.GetFireEventsAsync(query);
                allEvents.AddRange(events);
            }

            var response = new FireEventResponse
            {
                Events = allEvents,
                TotalCount = allEvents.Count
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting fire events for multiple townships");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get fire events filtered by bounding box
    /// </summary>
    /// <param name="minLon">Minimum longitude</param>
    /// <param name="minLat">Minimum latitude</param>
    /// <param name="maxLon">Maximum longitude</param>
    /// <param name="maxLat">Maximum latitude</param>
    /// <param name="fromDate">Start date filter (optional)</param>
    /// <param name="toDate">End date filter (optional)</param>
    /// <param name="status">Status filter (optional)</param>
    /// <param name="minIntensity">Minimum intensity filter (optional)</param>
    /// <param name="maxIntensity">Maximum intensity filter (optional)</param>
    /// <returns>Fire events within the specified bounding box</returns>
    [HttpGet("bbox")]
    public async Task<ActionResult<FireEventResponse>> GetFireEventsByBbox(
        [FromQuery] double minLon,
        [FromQuery] double minLat,
        [FromQuery] double maxLon,
        [FromQuery] double maxLat,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? status = null,
        [FromQuery] double? minIntensity = null,
        [FromQuery] double? maxIntensity = null)
    {
        try
        {
            _logger.LogInformation("Getting fire events for bbox: [{MinLon}, {MinLat}, {MaxLon}, {MaxLat}]", 
                minLon, minLat, maxLon, maxLat);

            var bbox = new double[] { minLon, minLat, maxLon, maxLat };
            
            var query = new FireEventQuery
            {
                Bbox = bbox,
                FromDate = fromDate,
                ToDate = toDate,
                Status = status,
                MinIntensity = minIntensity,
                MaxIntensity = maxIntensity
            };

            // For now, we'll return mock data that fits the bbox
            // In a real implementation, you would query all township grains and filter by bbox
            var mockEvents = GenerateMockFireEvents(bbox, query);
            
            var response = new FireEventResponse
            {
                Events = mockEvents,
                TotalCount = mockEvents.Count
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting fire events by bbox");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add a new fire event to a township
    /// </summary>
    /// <param name="township">Township name</param>
    /// <param name="fireEvent">Fire event data</param>
    /// <returns>Success status</returns>
    [HttpPost("township/{township}")]
    public async Task<ActionResult> AddFireEvent(string township, [FromBody] FireEvent fireEvent)
    {
        try
        {
            if (fireEvent == null)
            {
                return BadRequest("Fire event data is required");
            }

            _logger.LogInformation("Adding fire event to township: {Township}", township);

            var grain = _clusterClient.GetGrain<ITownshipFireGrain>(township);
            await grain.AddFireEventAsync(fireEvent);

            return Ok(new { message = "Fire event added successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding fire event to township: {Township}", township);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update an existing fire event
    /// </summary>
    /// <param name="township">Township name</param>
    /// <param name="eventId">Fire event ID</param>
    /// <param name="fireEvent">Updated fire event data</param>
    /// <returns>Success status</returns>
    [HttpPut("township/{township}/event/{eventId}")]
    public async Task<ActionResult> UpdateFireEvent(string township, string eventId, [FromBody] FireEvent fireEvent)
    {
        try
        {
            if (fireEvent == null)
            {
                return BadRequest("Fire event data is required");
            }

            fireEvent.Id = eventId; // Ensure the ID matches

            _logger.LogInformation("Updating fire event {EventId} in township: {Township}", eventId, township);

            var grain = _clusterClient.GetGrain<ITownshipFireGrain>(township);
            await grain.UpdateFireEventAsync(fireEvent);

            return Ok(new { message = "Fire event updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating fire event {EventId} in township: {Township}", eventId, township);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Remove a fire event
    /// </summary>
    /// <param name="township">Township name</param>
    /// <param name="eventId">Fire event ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("township/{township}/event/{eventId}")]
    public async Task<ActionResult> RemoveFireEvent(string township, string eventId)
    {
        try
        {
            _logger.LogInformation("Removing fire event {EventId} from township: {Township}", eventId, township);

            var grain = _clusterClient.GetGrain<ITownshipFireGrain>(township);
            await grain.RemoveFireEventAsync(eventId);

            return Ok(new { message = "Fire event removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing fire event {EventId} from township: {Township}", eventId, township);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get township summary
    /// </summary>
    /// <param name="township">Township name</param>
    /// <returns>Township fire summary</returns>
    [HttpGet("township/{township}/summary")]
    public async Task<ActionResult<TownshipFireSummary>> GetTownshipSummary(string township)
    {
        try
        {
            _logger.LogInformation("Getting summary for township: {Township}", township);

            var grain = _clusterClient.GetGrain<ITownshipFireGrain>(township);
            var summary = await grain.GetTownshipSummaryAsync();

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting summary for township: {Township}", township);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    /// <returns>Health status</returns>
    [HttpGet("health")]
    public ActionResult HealthCheck()
    {
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
    }

    private List<FireEvent> GenerateMockFireEvents(double[] bbox, FireEventQuery query)
    {
        var events = new List<FireEvent>();
        var random = new Random();
        
        // Generate 5-15 mock events within the bbox
        var eventCount = random.Next(5, 16);
        
        for (int i = 0; i < eventCount; i++)
        {
            var lon = random.NextDouble() * (bbox[2] - bbox[0]) + bbox[0];
            var lat = random.NextDouble() * (bbox[3] - bbox[1]) + bbox[1];
            
            var eventTime = DateTime.UtcNow.AddHours(-random.Next(1, 25));
            
            // Apply date filters if specified
            if (query.FromDate.HasValue && eventTime < query.FromDate.Value) continue;
            if (query.ToDate.HasValue && eventTime > query.ToDate.Value) continue;
            
            var intensity = random.NextDouble() * 10;
            
            // Apply intensity filters if specified
            if (query.MinIntensity.HasValue && intensity < query.MinIntensity.Value) continue;
            if (query.MaxIntensity.HasValue && intensity > query.MaxIntensity.Value) continue;
            
            var status = random.Next(3) switch
            {
                0 => "active",
                1 => "contained",
                _ => "resolved"
            };
            
            // Apply status filter if specified
            if (!string.IsNullOrEmpty(query.Status) && !status.Equals(query.Status, StringComparison.OrdinalIgnoreCase)) continue;
            
            events.Add(new FireEvent
            {
                Id = $"fire-{Guid.NewGuid():N}",
                Township = "MockTownship",
                Geometry = new Geometry
                {
                    Coordinates = new double[] { lon, lat }
                },
                Properties = new FireEventProperties
                {
                    Name = $"Fire Event {i + 1}",
                    Description = $"Mock fire event in the specified area",
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
                    Severity = intensity > 7 ? "High" : intensity > 4 ? "Medium" : "Low"
                }
            });
        }
        
        return events;
    }
} 