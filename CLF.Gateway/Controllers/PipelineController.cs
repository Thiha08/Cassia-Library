using Microsoft.AspNetCore.Mvc;
using CLF.Shared.Models;
using CLF.Shared.Interfaces;
using System.Text.Json;

namespace CLF.Gateway.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PipelineController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<PipelineController> _logger;

    public PipelineController(IHttpClientFactory httpClientFactory, ILogger<PipelineController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// Get pipeline status and health
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetPipelineStatus()
    {
        try
        {
            var services = new Dictionary<string, string>
            {
                { "Ingestion", "/health" },
                { "ETL", "/health" },
                { "Storage", "/health" },
                { "Orleans", "/health" }
            };

            var status = new Dictionary<string, object>();
            var httpClient = _httpClientFactory.CreateClient();

            foreach (var service in services)
            {
                try
                {
                    var client = _httpClientFactory.CreateClient($"{service.Key}Service");
                    var response = await client.GetAsync(service.Value);
                    status[service.Key] = new { Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy", StatusCode = (int)response.StatusCode };
                }
                catch (Exception ex)
                {
                    status[service.Key] = new { Status = "Unreachable", Error = ex.Message };
                }
            }

            return Ok(new { Services = status, Timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pipeline status");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Trigger data ingestion from external source
    /// </summary>
    [HttpPost("ingest")]
    public async Task<IActionResult> TriggerIngestion([FromBody] ExternalDataSource source)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("IngestionService");
            var response = await client.PostAsJsonAsync("/api/ingestion/trigger", source);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<RawData>();
                return Ok(result);
            }
            
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering ingestion for source: {SourceName}", source.Name);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get ingestion status
    /// </summary>
    [HttpGet("ingest/{id}")]
    public async Task<IActionResult> GetIngestionStatus(Guid id)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("IngestionService");
            var response = await client.GetAsync($"/api/ingestion/{id}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<RawData>();
                return Ok(result);
            }
            
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ingestion status for ID: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Trigger ETL processing
    /// </summary>
    [HttpPost("etl/{rawDataId}")]
    public async Task<IActionResult> TriggerETL(Guid rawDataId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("ETLService");
            var response = await client.PostAsync($"/api/etl/process/{rawDataId}", null);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<CleanData>();
                return Ok(result);
            }
            
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering ETL for raw data ID: {RawDataId}", rawDataId);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get ETL processing status
    /// </summary>
    [HttpGet("etl/{id}")]
    public async Task<IActionResult> GetETLStatus(Guid id)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("ETLService");
            var response = await client.GetAsync($"/api/etl/{id}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<CleanData>();
                return Ok(result);
            }
            
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ETL status for ID: {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get data from storage
    /// </summary>
    [HttpGet("data/{dataType}/{id}")]
    public async Task<IActionResult> GetData(string dataType, Guid id)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("StorageService");
            var response = await client.GetAsync($"/api/storage/{dataType}/{id}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting data for type: {DataType}, ID: {Id}", dataType, id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Search data
    /// </summary>
    [HttpPost("search")]
    public async Task<IActionResult> SearchData([FromBody] SearchRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("StorageService");
            var response = await client.PostAsJsonAsync("/api/storage/search", request);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<object>();
                return Ok(result);
            }
            
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching data");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }
}

public class SearchRequest
{
    public string Query { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public Dictionary<string, object> Filters { get; set; } = new();
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
} 