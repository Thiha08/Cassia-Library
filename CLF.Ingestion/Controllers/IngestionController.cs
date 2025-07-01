using Microsoft.AspNetCore.Mvc;
using CLF.Shared.Models;
using CLF.Shared.Interfaces;
using CLF.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLF.Ingestion.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngestionController : ControllerBase
{
    private readonly CLFDbContext _context;
    private readonly ILogger<IngestionController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public IngestionController(CLFDbContext context, ILogger<IngestionController> logger, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Trigger data ingestion from external source
    /// </summary>
    [HttpPost("trigger")]
    public async Task<IActionResult> TriggerIngestion([FromBody] ExternalDataSource source)
    {
        try
        {
            _logger.LogInformation("Starting ingestion for source: {SourceName}", source.Name);

            // Create raw data entry
            var rawData = new RawData
            {
                Id = Guid.NewGuid(),
                SourceId = source.Id,
                DataType = source.Type,
                RawContent = await ExtractDataFromSource(source),
                Metadata = new Dictionary<string, object>
                {
                    { "SourceName", source.Name },
                    { "IngestionTimestamp", DateTime.UtcNow },
                    { "SourceConfiguration", source.Configuration }
                },
                Status = DataIngestionStatus.InProgress,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "IngestionService"
            };

            // Store raw data
            _context.RawData.Add(rawData);
            await _context.SaveChangesAsync();

            // Validate raw data
            var isValid = await ValidateRawData(rawData);
            if (!isValid)
            {
                rawData.Status = DataIngestionStatus.Failed;
                rawData.ErrorMessage = "Data validation failed";
                await _context.SaveChangesAsync();
                return BadRequest(new { Error = "Data validation failed", RawDataId = rawData.Id });
            }

            // Mark as completed
            rawData.Status = DataIngestionStatus.Completed;
            await _context.SaveChangesAsync();

            // Trigger ETL processing
            await TriggerETLProcessing(rawData.Id);

            _logger.LogInformation("Ingestion completed successfully for source: {SourceName}, RawDataId: {RawDataId}", source.Name, rawData.Id);

            return Ok(rawData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during ingestion for source: {SourceName}", source.Name);
            return StatusCode(500, new { Error = "Internal server error during ingestion" });
        }
    }

    /// <summary>
    /// Get ingestion status by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetIngestionStatus(Guid id)
    {
        try
        {
            var rawData = await _context.RawData.FindAsync(id);
            if (rawData == null)
            {
                return NotFound(new { Error = "Raw data not found" });
            }

            return Ok(rawData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ingestion status for ID: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get all ingestion records
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllIngestions([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.RawData
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var rawData = await query.ToListAsync();
            var totalCount = await _context.RawData.CountAsync();

            return Ok(new
            {
                Data = rawData,
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
            _logger.LogError(ex, "Error getting all ingestions");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Retry failed ingestion
    /// </summary>
    [HttpPost("{id}/retry")]
    public async Task<IActionResult> RetryIngestion(Guid id)
    {
        try
        {
            var rawData = await _context.RawData.FindAsync(id);
            if (rawData == null)
            {
                return NotFound(new { Error = "Raw data not found" });
            }

            if (rawData.Status != DataIngestionStatus.Failed)
            {
                return BadRequest(new { Error = "Can only retry failed ingestions" });
            }

            // Reset status and retry
            rawData.Status = DataIngestionStatus.InProgress;
            rawData.RetryCount++;
            rawData.UpdatedAt = DateTime.UtcNow;
            rawData.UpdatedBy = "IngestionService";

            await _context.SaveChangesAsync();

            // Re-trigger ETL processing
            await TriggerETLProcessing(rawData.Id);

            return Ok(rawData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying ingestion for ID: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    private async Task<string> ExtractDataFromSource(ExternalDataSource source)
    {
        // Simulate data extraction from external source
        // In a real implementation, this would connect to the actual external source
        await Task.Delay(1000); // Simulate network delay

        return $"{{\"source\": \"{source.Name}\", \"type\": \"{source.Type}\", \"timestamp\": \"{DateTime.UtcNow:O}\", \"data\": \"Sample data from {source.Name}\"}}";
    }

    private async Task<bool> ValidateRawData(RawData rawData)
    {
        // Simulate data validation
        // In a real implementation, this would validate the raw data structure and content
        await Task.Delay(500); // Simulate validation time

        // Basic validation - check if content is not empty
        return !string.IsNullOrEmpty(rawData.RawContent);
    }

    private async Task TriggerETLProcessing(Guid rawDataId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("ETLService");
            var response = await client.PostAsync($"/api/etl/process/{rawDataId}", null);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to trigger ETL processing for RawDataId: {RawDataId}, Status: {StatusCode}", rawDataId, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering ETL processing for RawDataId: {RawDataId}", rawDataId);
        }
    }
} 