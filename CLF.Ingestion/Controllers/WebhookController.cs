using Microsoft.AspNetCore.Mvc;
using CLF.Ingestion.Grains.Interfaces;
using Orleans;

namespace CLF.Ingestion.Controllers;

/// <summary>
/// Controller for handling external webhooks
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    private readonly ILogger<WebhookController> _logger;
    private readonly IClusterClient _clusterClient;

    public WebhookController(ILogger<WebhookController> logger, IClusterClient clusterClient)
    {
        _logger = logger;
        _clusterClient = clusterClient;
    }

    /// <summary>
    /// Handle NASA FIRMS webhook
    /// </summary>
    [HttpPost("nasa-firms")]
    public async Task<IActionResult> HandleNasaFirmsWebhook([FromBody] object payload)
    {
        try
        {
            _logger.LogInformation("Received NASA FIRMS webhook");
            
            var grain = _clusterClient.GetGrain<INasaFirmsIngestionGrain>("nasa-firms");
            await grain.ProcessWebhookAsync(System.Text.Json.JsonSerializer.Serialize(payload));

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing NASA FIRMS webhook");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Handle USGS webhook
    /// </summary>
    [HttpPost("usgs")]
    public async Task<IActionResult> HandleUSGSWebhook([FromBody] object payload)
    {
        try
        {
            _logger.LogInformation("Received USGS webhook");
            
            var grain = _clusterClient.GetGrain<IUSGSIngestionGrain>("usgs");
            await grain.ProcessWebhookAsync(System.Text.Json.JsonSerializer.Serialize(payload));

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing USGS webhook");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Handle GDACS webhook
    /// </summary>
    [HttpPost("gdacs")]
    public async Task<IActionResult> HandleGDACSWebhook([FromBody] object payload)
    {
        try
        {
            _logger.LogInformation("Received GDACS webhook");
            
            var grain = _clusterClient.GetGrain<IGDACSIngestionGrain>("gdacs");
            await grain.ProcessWebhookAsync(System.Text.Json.JsonSerializer.Serialize(payload));

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing GDACS webhook");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Handle Twitter webhook
    /// </summary>
    [HttpPost("twitter")]
    public async Task<IActionResult> HandleTwitterWebhook([FromBody] object payload)
    {
        try
        {
            _logger.LogInformation("Received Twitter webhook");
            
            var grain = _clusterClient.GetGrain<ITwitterIngestionGrain>("twitter");
            await grain.ProcessWebhookAsync(System.Text.Json.JsonSerializer.Serialize(payload));

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Twitter webhook");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Handle Cassia User Report webhook
    /// </summary>
    [HttpPost("cassia-user-report")]
    public async Task<IActionResult> HandleCassiaUserReportWebhook([FromBody] object payload)
    {
        try
        {
            _logger.LogInformation("Received Cassia User Report webhook");
            
            var grain = _clusterClient.GetGrain<ICassiaUserReportIngestionGrain>("cassia-user-report");
            await grain.ProcessWebhookAsync(System.Text.Json.JsonSerializer.Serialize(payload));

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Cassia User Report webhook");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Generic webhook handler
    /// </summary>
    [HttpPost("generic/{sourceType}")]
    public async Task<IActionResult> HandleGenericWebhook(string sourceType, [FromBody] object payload)
    {
        try
        {
            _logger.LogInformation("Received generic webhook for source type: {SourceType}", sourceType);
            
            var grain = GetIngestionGrain(sourceType);
            await grain.ProcessWebhookAsync(System.Text.Json.JsonSerializer.Serialize(payload));

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing generic webhook for source type: {SourceType}", sourceType);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    private IIngestionGrain GetIngestionGrain(string sourceType)
    {
        return sourceType.ToLower() switch
        {
            "nasa-firms" => _clusterClient.GetGrain<INasaFirmsIngestionGrain>(sourceType),
            "usgs" => _clusterClient.GetGrain<IUSGSIngestionGrain>(sourceType),
            "gdacs" => _clusterClient.GetGrain<IGDACSIngestionGrain>(sourceType),
            "twitter" => _clusterClient.GetGrain<ITwitterIngestionGrain>(sourceType),
            "cassia-user-report" => _clusterClient.GetGrain<ICassiaUserReportIngestionGrain>(sourceType),
            _ => throw new ArgumentException($"Unsupported source type: {sourceType}")
        };
    }
} 