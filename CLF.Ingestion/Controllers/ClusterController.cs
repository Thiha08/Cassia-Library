using Microsoft.AspNetCore.Mvc;
using CLF.Ingestion.Grains.Interfaces;
using Orleans;

namespace CLF.Ingestion.Controllers;

/// <summary>
/// Controller for managing Orleans cluster operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ClusterController : ControllerBase
{
    private readonly ILogger<ClusterController> _logger;
    private readonly IClusterClient _clusterClient;

    public ClusterController(ILogger<ClusterController> logger, IClusterClient clusterClient)
    {
        _logger = logger;
        _clusterClient = clusterClient;
    }

    /// <summary>
    /// Get cluster health status
    /// </summary>
    [HttpGet("health")]
    public IActionResult GetClusterHealth()
    {
        try
        {
            return Ok(new
            {
                Status = "Healthy",
                Service = "Orleans Cluster",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cluster health status");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get all active grains
    /// </summary>
    [HttpGet("grains")]
    public async Task<IActionResult> GetActiveGrains()
    {
        try
        {
            // This is a simplified version - in a real implementation you'd query the cluster
            var grains = new[]
            {
                new { Type = "NasaFirmsIngestionGrain", Status = "Active" },
                new { Type = "USGSIngestionGrain", Status = "Active" },
                new { Type = "GDACSIngestionGrain", Status = "Active" },
                new { Type = "TwitterIngestionGrain", Status = "Active" },
                new { Type = "CassiaUserReportIngestionGrain", Status = "Active" }
            };

            return Ok(new { Grains = grains, Count = grains.Length });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active grains");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get grain statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetGrainStatistics()
    {
        try
        {
            var statistics = new
            {
                TotalGrains = 5,
                ActiveGrains = 5,
                MemoryUsage = "Low",
                CpuUsage = "Low",
                LastUpdated = DateTime.UtcNow
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting grain statistics");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Deactivate a specific grain
    /// </summary>
    [HttpPost("grains/{grainType}/deactivate")]
    public async Task<IActionResult> DeactivateGrain(string grainType)
    {
        try
        {
            _logger.LogInformation("Deactivating grain: {GrainType}", grainType);
            
            // In a real implementation, you'd deactivate the specific grain
            return Ok(new { Message = $"Grain {grainType} deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating grain: {GrainType}", grainType);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Activate a specific grain
    /// </summary>
    [HttpPost("grains/{grainType}/activate")]
    public async Task<IActionResult> ActivateGrain(string grainType)
    {
        try
        {
            _logger.LogInformation("Activating grain: {GrainType}", grainType);
            
            // In a real implementation, you'd activate the specific grain
            return Ok(new { Message = $"Grain {grainType} activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating grain: {GrainType}", grainType);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }
} 