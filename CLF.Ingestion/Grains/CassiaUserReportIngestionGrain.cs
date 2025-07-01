using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

namespace CLF.Ingestion.Grains;

public class CassiaUserReportIngestionGrain : BaseIngestionGrain
{
    public CassiaUserReportIngestionGrain(ILogger<CassiaUserReportIngestionGrain> logger) : base(logger) { }

    protected override IDataSourceAdapter GetAdapter()
    {
        return new CassiaUserReportAdapter(Logger);
    }

    protected override string GetStreamNamespace() => "CASSIA_USER_REPORT";

    protected override async Task<RawData?> ProcessWebhookPayloadAsync(string payload)
    {
        _logger.LogInformation("Processing Cassia user report webhook payload");
        try
        {
            var userReport = JsonSerializer.Deserialize<UserReport>(payload);
            if (userReport == null) return null;
            var adapter = (CassiaUserReportAdapter)GetAdapter();
            return await adapter.ProcessUserReportAsync(userReport, _source?.Id ?? Guid.Empty);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Cassia user report webhook payload");
            return null;
        }
    }
} 