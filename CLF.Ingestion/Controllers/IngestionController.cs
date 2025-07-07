using Microsoft.AspNetCore.Mvc;
using CLF.Shared.Models;
using CLF.Shared.Interfaces;
using CLF.Infrastructure.Data;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Factories;
using Microsoft.EntityFrameworkCore;
using Orleans;
using CLF.Ingestion.Grains;

namespace CLF.Ingestion.Controllers;

/// <summary>
/// Controller for managing data ingestion operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class IngestionController : ControllerBase
{
    private readonly CLFDbContext _context;
    private readonly ILogger<IngestionController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IClusterClient _clusterClient;
    private readonly DataSourceRegistry _dataSourceRegistry;

    public IngestionController(
        CLFDbContext context, 
        ILogger<IngestionController> logger, 
        IHttpClientFactory httpClientFactory,
        IClusterClient clusterClient,
        DataSourceRegistry dataSourceRegistry)
    {
        _context = context;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
        _clusterClient = clusterClient;
        _dataSourceRegistry = dataSourceRegistry;
    }

    /// <summary>
    /// Get all available data sources
    /// </summary>
    [HttpGet("sources")]
    public async Task<IActionResult> GetDataSources()
    {
        try
        {
            var sources = await _context.ExternalDataSources.ToListAsync();
            return Ok(new { Sources = sources, Count = sources.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting data sources");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Register a new data source
    /// </summary>
    [HttpPost("sources")]
    public async Task<IActionResult> RegisterDataSource([FromBody] ExternalDataSource source)
    {
        try
        {
            if (await _context.ExternalDataSources.AnyAsync(s => s.Name == source.Name))
            {
                return BadRequest(new { Error = "Data source with this name already exists" });
            }

            source.Id = Guid.NewGuid();
            source.CreatedAt = DateTime.UtcNow;

            _context.ExternalDataSources.Add(source);
            await _context.SaveChangesAsync();

            // Register with Orleans grain
            await RegisterDataSourceGrain(source);

            _logger.LogInformation("Registered new data source: {SourceName}", source.Name);
            return CreatedAtAction(nameof(GetDataSource), new { id = source.Id }, source);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering data source: {SourceName}", source.Name);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get a specific data source
    /// </summary>
    [HttpGet("sources/{id}")]
    public async Task<IActionResult> GetDataSource(Guid id)
    {
        try
        {
            var source = await _context.ExternalDataSources.FindAsync(id);
            if (source == null)
            {
                return NotFound(new { Error = "Data source not found" });
            }

            return Ok(source);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting data source: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Start polling for a data source
    /// </summary>
    [HttpPost("sources/{id}/start")]
    public async Task<IActionResult> StartPolling(Guid id)
    {
        try
        {
            var source = await _context.ExternalDataSources.FindAsync(id);
            if (source == null)
            {
                return NotFound(new { Error = "Data source not found" });
            }

            var grain = GetIngestionGrain(source.Type);
            await grain.InitializeAsync(source);
            await grain.StartPollingAsync();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Started polling for data source: {SourceName}", source.Name);
            return Ok(new { Message = "Polling started successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting polling for data source: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Stop polling for a data source
    /// </summary>
    [HttpPost("sources/{id}/stop")]
    public async Task<IActionResult> StopPolling(Guid id)
    {
        try
        {
            var source = await _context.ExternalDataSources.FindAsync(id);
            if (source == null)
            {
                return NotFound(new { Error = "Data source not found" });
            }

            var grain = GetIngestionGrain(source.Type);
            await grain.StopPollingAsync();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Stopped polling for data source: {SourceName}", source.Name);
            return Ok(new { Message = "Polling stopped successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping polling for data source: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get status of a data source
    /// </summary>
    [HttpGet("sources/{id}/status")]
    public async Task<IActionResult> GetDataSourceStatus(Guid id)
    {
        try
        {
            var source = await _context.ExternalDataSources.FindAsync(id);
            if (source == null)
            {
                return NotFound(new { Error = "Data source not found" });
            }

            var grain = GetIngestionGrain(source.Type);
            var status = await grain.GetStatusAsync();

            return Ok(new { Source = source, Status = status });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting status for data source: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Trigger manual fetch for a data source
    /// </summary>
    [HttpPost("sources/{id}/fetch")]
    public async Task<IActionResult> TriggerFetch(Guid id)
    {
        try
        {
            var source = await _context.ExternalDataSources.FindAsync(id);
            if (source == null)
            {
                return NotFound(new { Error = "Data source not found" });
            }

            var grain = GetIngestionGrain(source.Type);
            await grain.InitializeAsync(source);
            var result = await grain.TriggerFetchAsync();

            _logger.LogInformation("Manual fetch triggered for data source: {SourceName}, Success: {Success}", 
                source.Name, result.Success);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering fetch for data source: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Process webhook for a data source
    /// </summary>
    [HttpPost("sources/{id}/webhook")]
    public async Task<IActionResult> ProcessWebhook(Guid id, [FromBody] string payload)
    {
        try
        {
            var source = await _context.ExternalDataSources.FindAsync(id);
            if (source == null)
            {
                return NotFound(new { Error = "Data source not found" });
            }

            var grain = GetIngestionGrain(source.Type);
            await grain.InitializeAsync(source);
            await grain.ProcessWebhookAsync(payload);

            _logger.LogInformation("Webhook processed for data source: {SourceName}", source.Name);
            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook for data source: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get all ingestion records with pagination
    /// </summary>
    [HttpGet("records")]
    public async Task<IActionResult> GetIngestionRecords(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? sourceType = null)
    {
        try
        {
            var query = _context.RawData.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<DataIngestionStatus>(status, out var statusEnum))
                {
                    query = query.Where(r => r.Status == statusEnum);
                }
            }

            if (!string.IsNullOrEmpty(sourceType))
            {
                query = query.Where(r => r.DataType == sourceType);
            }

            var totalCount = await query.CountAsync();
            var records = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Data = records,
                Pagination = new
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ingestion records");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get ingestion record by ID
    /// </summary>
    [HttpGet("records/{id}")]
    public async Task<IActionResult> GetIngestionRecord(Guid id)
    {
        try
        {
            var record = await _context.RawData.FindAsync(id);
            if (record == null)
            {
                return NotFound(new { Error = "Ingestion record not found" });
            }

            return Ok(record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ingestion record: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Retry failed ingestion
    /// </summary>
    [HttpPost("records/{id}/retry")]
    public async Task<IActionResult> RetryIngestion(Guid id)
    {
        try
        {
            var record = await _context.RawData.FindAsync(id);
            if (record == null)
            {
                return NotFound(new { Error = "Ingestion record not found" });
            }

            if (record.Status != DataIngestionStatus.Failed)
            {
                return BadRequest(new { Error = "Can only retry failed ingestions" });
            }

            record.Status = DataIngestionStatus.InProgress;
            record.RetryCount++;
            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = "IngestionService";

            await _context.SaveChangesAsync();

            // Re-trigger ETL processing
            await TriggerETLProcessing(record.Id);

            _logger.LogInformation("Retrying ingestion record: {Id}", id);
            return Ok(record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying ingestion record: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get cluster health status
    /// </summary>
    [HttpGet("health")]
    public IActionResult GetHealth()
    {
        try
        {
            return Ok(new
            {
                Status = "Healthy",
                Service = "Ingestion",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Orleans = "Connected"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting health status");
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

    private async Task RegisterDataSourceGrain(ExternalDataSource source)
    {
        try
        {
            var grain = GetIngestionGrain(source.Type);
            await grain.InitializeAsync(source);
            await _dataSourceRegistry.RegisterDataSourceAsync(source);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering data source grain: {SourceName}", source.Name);
        }
    }

    private async Task TriggerETLProcessing(Guid rawDataId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("ETLService");
            var response = await client.PostAsync($"/api/etl/process/{rawDataId}", null);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to trigger ETL processing for RawDataId: {RawDataId}, Status: {StatusCode}", 
                    rawDataId, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering ETL processing for RawDataId: {RawDataId}", rawDataId);
        }
    }
} 