using CLF.Shared.Models;
using System.Text.Json;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// USGS (United States Geological Survey) adapter
/// Provides earthquake and seismic data
/// </summary>
public class USGSAdapter : IDataSourceAdapter
{
    private readonly HttpClient _httpClient;
    private readonly ILogger _logger;
    private readonly string _baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";

    public USGSAdapter(HttpClient httpClient, ILogger logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public string SourceName => "USGS_EARTHQUAKES";
    public string SourceType => "Seismic_Data";

    public async Task<List<RawData>> FetchDataAsync(ExternalDataSource source)
    {
        try
        {
            _logger.LogInformation("Fetching USGS earthquake data for source: {SourceName}", source.Name);

            // Extract configuration parameters
            var magnitude = source.Configuration.GetValueOrDefault("Magnitude", "all_day");
            var format = source.Configuration.GetValueOrDefault("Format", "geojson");

            // Build API URL
            var url = $"{_baseUrl}{magnitude}.{format}";

            // Fetch data from USGS API
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonContent = await response.Content.ReadAsStringAsync();
            
            // Parse GeoJSON and convert to RawData
            var rawDataList = ParseUsgsGeoJson(jsonContent, source.Id);

            _logger.LogInformation("Successfully fetched {Count} earthquake records from USGS", rawDataList.Count);

            return rawDataList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching USGS earthquake data for source: {SourceName}", source.Name);
            throw;
        }
    }

    public async Task<bool> ValidateConnectionAsync(ExternalDataSource source)
    {
        try
        {
            // Test connection with a minimal request
            var testUrl = $"{_baseUrl}all_day.geojson";
            var response = await _httpClient.GetAsync(testUrl);
            
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating USGS connection");
            return false;
        }
    }

    private List<RawData> ParseUsgsGeoJson(string jsonContent, Guid sourceId)
    {
        var rawDataList = new List<RawData>();

        try
        {
            using var document = JsonDocument.Parse(jsonContent);
            var root = document.RootElement;

            if (root.TryGetProperty("features", out var features))
            {
                foreach (var feature in features.EnumerateArray())
                {
                    try
                    {
                        var rawData = new RawData
                        {
                            Id = Guid.NewGuid(),
                            SourceId = sourceId,
                            DataType = "USGS_EARTHQUAKE",
                            RawContent = feature.GetRawText(),
                            Metadata = new Dictionary<string, object>
                            {
                                { "SourceName", "USGS_EARTHQUAKES" },
                                { "FeatureType", "Feature" },
                                { "ParsedAt", DateTime.UtcNow }
                            },
                            Status = DataIngestionStatus.Completed,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "USGSAdapter"
                        };

                        // Extract additional metadata from the feature
                        if (feature.TryGetProperty("properties", out var properties))
                        {
                            if (properties.TryGetProperty("mag", out var mag))
                                rawData.Metadata["Magnitude"] = mag.GetDouble();
                            
                            if (properties.TryGetProperty("place", out var place))
                                rawData.Metadata["Place"] = place.GetString() ?? "";
                            
                            if (properties.TryGetProperty("time", out var time))
                                rawData.Metadata["Time"] = time.GetInt64();
                            
                            if (properties.TryGetProperty("title", out var title))
                                rawData.Metadata["Title"] = title.GetString() ?? "";
                        }

                        if (feature.TryGetProperty("geometry", out var geometry))
                        {
                            if (geometry.TryGetProperty("coordinates", out var coordinates))
                            {
                                var coords = coordinates.EnumerateArray().ToArray();
                                if (coords.Length >= 2)
                                {
                                    rawData.Metadata["Longitude"] = coords[0].GetDouble();
                                    rawData.Metadata["Latitude"] = coords[1].GetDouble();
                                    if (coords.Length > 2)
                                        rawData.Metadata["Depth"] = coords[2].GetDouble();
                                }
                            }
                        }

                        rawDataList.Add(rawData);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error parsing USGS earthquake feature");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing USGS GeoJSON content");
        }

        return rawDataList;
    }
} 