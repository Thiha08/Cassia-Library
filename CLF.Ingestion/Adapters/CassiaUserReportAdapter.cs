using CLF.Shared.Models;
using System.Text.Json;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// Cassia User Report adapter for crowdsourced disaster reports
/// Handles user-submitted disaster reports from the Cassia Map application
/// </summary>
public class CassiaUserReportAdapter : IDataSourceAdapter
{
    private readonly ILogger _logger;

    public CassiaUserReportAdapter(ILogger logger)
    {
        _logger = logger;
    }

    public string SourceName => "CASSIA_USER_REPORTS";
    public string SourceType => "Crowdsourced_Reports";

    public async Task<List<RawData>> FetchDataAsync(ExternalDataSource source)
    {
        try
        {
            _logger.LogInformation("Processing Cassia user reports for source: {SourceName}", source.Name);

            // For user reports, we typically process them as they come in via webhooks
            // This method is mainly for batch processing of stored reports
            var rawDataList = new List<RawData>();

            // Extract configuration parameters
            var batchSize = int.TryParse(source.Configuration.GetValueOrDefault("BatchSize", "100"), out var size) ? size : 100;
            var timeWindow = source.Configuration.GetValueOrDefault("TimeWindow", "24"); // hours

            // In a real implementation, this would query a database or queue for pending user reports
            // For now, we'll return an empty list as user reports are typically processed via webhooks
            _logger.LogInformation("No batch user reports to process for source: {SourceName}", source.Name);

            return rawDataList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Cassia user reports for source: {SourceName}", source.Name);
            throw;
        }
    }

    public async Task<bool> ValidateConnectionAsync(ExternalDataSource source)
    {
        try
        {
            // For user reports, validation typically means checking if the webhook endpoint is accessible
            // or if the database connection for storing reports is working
            _logger.LogInformation("Validating Cassia user report source: {SourceName}", source.Name);
            
            // In a real implementation, this would check:
            // 1. Database connectivity for storing reports
            // 2. Webhook endpoint accessibility
            // 3. Authentication/authorization setup
            
            return true; // Assume valid for now
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Cassia user report source");
            return false;
        }
    }

    /// <summary>
    /// Process a single user report (typically called from webhook)
    /// </summary>
    public async Task<RawData> ProcessUserReportAsync(UserReport userReport, Guid sourceId)
    {
        try
        {
            _logger.LogInformation("Processing user report from user: {UserId}", userReport.UserId);

            var rawData = new RawData
            {
                Id = Guid.NewGuid(),
                SourceId = sourceId,
                DataType = "CASSIA_USER_REPORT",
                RawContent = JsonSerializer.Serialize(userReport),
                Metadata = new Dictionary<string, object>
                {
                    { "SourceName", "CASSIA_USER_REPORTS" },
                    { "UserId", userReport.UserId },
                    { "ReportType", userReport.ReportType },
                    { "Severity", userReport.Severity },
                    { "Latitude", userReport.Latitude },
                    { "Longitude", userReport.Longitude },
                    { "ReportedAt", userReport.ReportedAt },
                    { "ParsedAt", DateTime.UtcNow }
                },
                Status = DataIngestionStatus.Completed,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "CassiaUserReportAdapter"
            };

            // Add additional metadata based on report type
            if (!string.IsNullOrEmpty(userReport.Description))
            {
                rawData.Metadata["Description"] = userReport.Description;
            }

            if (userReport.Photos?.Any() == true)
            {
                rawData.Metadata["PhotoCount"] = userReport.Photos.Count;
            }

            if (userReport.Tags?.Any() == true)
            {
                rawData.Metadata["Tags"] = string.Join(",", userReport.Tags);
            }

            _logger.LogInformation("Successfully processed user report: {ReportId}", rawData.Id);

            return rawData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing user report from user: {UserId}", userReport.UserId);
            throw;
        }
    }
}

/// <summary>
/// User report model for Cassia Map crowdsourced reports
/// </summary>
public class UserReport
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty; // Fire, Flood, Earthquake, etc.
    public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Description { get; set; }
    public List<string>? Photos { get; set; }
    public List<string>? Tags { get; set; }
    public DateTime ReportedAt { get; set; }
    public Dictionary<string, object>? AdditionalData { get; set; }
} 