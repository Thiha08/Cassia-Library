using CLF.Shared.Models;
using System.Text.Json;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// NASA FIRMS (Fire Information for Resource Management System) adapter
/// Provides satellite-based fire detection data with circuit breaker and retry patterns
/// </summary>
public class NasaFirmsAdapter : ResilientDataSourceAdapter
{
    private readonly string _baseUrl = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/";

    public NasaFirmsAdapter(IHttpClientFactory httpClientFactory, ILogger<NasaFirmsAdapter> logger) 
        : base(httpClientFactory, logger)
    {
    }

    public override string SourceName => "NASA_FIRMS";
    public override string SourceType => "Satellite_Fire_Detection";

    protected override string GetHttpClientName() => "NasaFirmsClient";

    protected override async Task<List<RawData>> FetchDataInternalAsync(HttpClient client, ExternalDataSource source)
    {
        // Extract configuration parameters
        var apiKey = source.Configuration.GetValueOrDefault("ApiKey", "");
        var area = source.Configuration.GetValueOrDefault("Area", "global");
        var satellite = source.Configuration.GetValueOrDefault("Satellite", "VIIRS_SNPP_NRT");
        var days = source.Configuration.GetValueOrDefault("Days", "1");

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("NASA FIRMS API key is required");
        }

        // Build API URL
        var url = $"{_baseUrl}{apiKey}/{satellite}/{area}/{days}";

        // Fetch data from NASA FIRMS API
        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var csvContent = await response.Content.ReadAsStringAsync();
        
        // Parse CSV and convert to RawData
        var rawDataList = ParseFirmsCsv(csvContent, source.Id);

        _logger.LogInformation("Successfully fetched {Count} fire detection records from NASA FIRMS", rawDataList.Count);

        return rawDataList;
    }

    protected override async Task<bool> ValidateConnectionInternalAsync(HttpClient client, ExternalDataSource source)
    {
        var apiKey = source.Configuration.GetValueOrDefault("ApiKey", "");
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("NASA FIRMS API key is missing");
            return false;
        }

        // Test connection with a minimal request
        var testUrl = $"{_baseUrl}{apiKey}/VIIRS_SNPP_NRT/global/1";
        var response = await client.GetAsync(testUrl);
        
        return response.IsSuccessStatusCode;
    }

    private List<RawData> ParseFirmsCsv(string csvContent, Guid sourceId)
    {
        var rawDataList = new List<RawData>();
        var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        // Skip header line
        for (int i = 1; i < lines.Length; i++)
        {
            try
            {
                var line = lines[i];
                var fields = ParseCsvLine(line);

                if (fields.Length >= 8)
                {
                    var rawData = new RawData
                    {
                        Id = Guid.NewGuid(),
                        SourceId = sourceId,
                        DataType = "NASA_FIRMS_FIRE_DETECTION",
                        RawContent = JsonSerializer.Serialize(new
                        {
                            latitude = double.TryParse(fields[0], out var lat) ? lat : 0.0,
                            longitude = double.TryParse(fields[1], out var lon) ? lon : 0.0,
                            brightness = double.TryParse(fields[2], out var bright) ? bright : 0.0,
                            scan = double.TryParse(fields[3], out var scan) ? scan : 0.0,
                            track = double.TryParse(fields[4], out var track) ? track : 0.0,
                            acq_date = fields[5],
                            acq_time = fields[6],
                            satellite = fields[7],
                            confidence = fields.Length > 8 ? fields[8] : "",
                            version = fields.Length > 9 ? fields[9] : "",
                            bright_t31 = fields.Length > 10 ? fields[10] : "",
                            frp = fields.Length > 11 ? fields[11] : ""
                        }),
                        Metadata = new Dictionary<string, object>
                        {
                            { "SourceName", "NASA_FIRMS" },
                            { "Satellite", fields.Length > 7 ? fields[7] : "Unknown" },
                            { "AcquisitionDate", fields.Length > 5 ? fields[5] : "" },
                            { "Confidence", fields.Length > 8 ? fields[8] : "" },
                            { "ApiVersion", "4.0.11" }
                        },
                        Status = DataIngestionStatus.Completed,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "NasaFirmsAdapter"
                    };

                    rawDataList.Add(rawData);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error parsing FIRMS CSV line {LineNumber}: {Line}", i, lines[i]);
            }
        }

        return rawDataList;
    }

    private string[] ParseCsvLine(string line)
    {
        // Simple CSV parsing - in production, use a proper CSV library
        return line.Split(',').Select(field => field.Trim('"')).ToArray();
    }
} 