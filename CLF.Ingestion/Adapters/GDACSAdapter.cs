using CLF.Shared.Models;
using System.Text.Json;
using System.Xml;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// GDACS (Global Disaster Alert and Coordination System) adapter
/// Provides disaster alerts and coordination data
/// </summary>
public class GDACSAdapter : IDataSourceAdapter
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GDACSAdapter> _logger;
    private readonly string _baseUrl = "https://www.gdacs.org/xml/rss.xml";

    public GDACSAdapter(HttpClient httpClient, ILogger<GDACSAdapter> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public string SourceName => "GDACS_ALERTS";
    public string SourceType => "Disaster_Alerts";

    public async Task<List<RawData>> FetchDataAsync(ExternalDataSource source)
    {
        try
        {
            _logger.LogInformation("Fetching GDACS alert data for source: {SourceName}", source.Name);

            // Extract configuration parameters
            var alertType = source.Configuration.GetValueOrDefault("AlertType", "all");
            var region = source.Configuration.GetValueOrDefault("Region", "global");

            // Build API URL based on alert type
            var url = GetGdacsUrl(alertType, region);

            // Fetch data from GDACS RSS feed
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var xmlContent = await response.Content.ReadAsStringAsync();
            
            // Parse RSS XML and convert to RawData
            var rawDataList = ParseGdacsRss(xmlContent, source.Id);

            _logger.LogInformation("Successfully fetched {Count} disaster alert records from GDACS", rawDataList.Count);

            return rawDataList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching GDACS alert data for source: {SourceName}", source.Name);
            throw;
        }
    }

    public async Task<bool> ValidateConnectionAsync(ExternalDataSource source)
    {
        try
        {
            // Test connection with the main RSS feed
            var response = await _httpClient.GetAsync(_baseUrl);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating GDACS connection");
            return false;
        }
    }

    private string GetGdacsUrl(string alertType, string region)
    {
        // GDACS provides different RSS feeds for different alert types
        return alertType.ToLower() switch
        {
            "earthquake" => "https://www.gdacs.org/xml/rss_EQ.xml",
            "tsunami" => "https://www.gdacs.org/xml/rss_TS.xml",
            "flood" => "https://www.gdacs.org/xml/rss_FL.xml",
            "tropical_cyclone" => "https://www.gdacs.org/xml/rss_TC.xml",
            "volcano" => "https://www.gdacs.org/xml/rss_VO.xml",
            _ => _baseUrl // Default to all alerts
        };
    }

    private List<RawData> ParseGdacsRss(string xmlContent, Guid sourceId)
    {
        var rawDataList = new List<RawData>();

        try
        {
            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            var items = xmlDoc.SelectNodes("//item");
            if (items != null)
            {
                foreach (XmlNode item in items)
                {
                    try
                    {
                        var rawData = new RawData
                        {
                            Id = Guid.NewGuid(),
                            SourceId = sourceId,
                            DataType = "GDACS_DISASTER_ALERT",
                            RawContent = item.OuterXml,
                            Metadata = new Dictionary<string, object>
                            {
                                { "SourceName", "GDACS_ALERTS" },
                                { "ParsedAt", DateTime.UtcNow }
                            },
                            Status = DataIngestionStatus.Completed,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "GDACSAdapter"
                        };

                        // Extract metadata from RSS item
                        var title = item.SelectSingleNode("title")?.InnerText ?? "";
                        var description = item.SelectSingleNode("description")?.InnerText ?? "";
                        var link = item.SelectSingleNode("link")?.InnerText ?? "";
                        var pubDate = item.SelectSingleNode("pubDate")?.InnerText ?? "";
                        var guid = item.SelectSingleNode("guid")?.InnerText ?? "";

                        rawData.Metadata["Title"] = title;
                        rawData.Metadata["Description"] = description;
                        rawData.Metadata["Link"] = link;
                        rawData.Metadata["PublishedDate"] = pubDate;
                        rawData.Metadata["Guid"] = guid;

                        // Try to extract coordinates from description or title
                        var coordinates = ExtractCoordinates(description + " " + title);
                        if (coordinates.HasValue)
                        {
                            rawData.Metadata["Latitude"] = coordinates.Value.Latitude;
                            rawData.Metadata["Longitude"] = coordinates.Value.Longitude;
                        }

                        // Determine alert type from title or description
                        var alertType = DetermineAlertType(title, description);
                        rawData.Metadata["AlertType"] = alertType;

                        rawDataList.Add(rawData);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error parsing GDACS RSS item");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing GDACS RSS content");
        }

        return rawDataList;
    }

    private (double Latitude, double Longitude)? ExtractCoordinates(string text)
    {
        // Simple coordinate extraction - in production, use more sophisticated parsing
        // Look for patterns like "lat: X, lon: Y" or "X°N, Y°E"
        var latMatch = System.Text.RegularExpressions.Regex.Match(text, @"lat[:\s]*([-\d.]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        var lonMatch = System.Text.RegularExpressions.Regex.Match(text, @"lon[:\s]*([-\d.]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        if (latMatch.Success && lonMatch.Success)
        {
            if (double.TryParse(latMatch.Groups[1].Value, out var lat) && 
                double.TryParse(lonMatch.Groups[1].Value, out var lon))
            {
                return (lat, lon);
            }
        }

        return null;
    }

    private string DetermineAlertType(string title, string description)
    {
        var text = (title + " " + description).ToLower();
        
        if (text.Contains("earthquake") || text.Contains("quake"))
            return "Earthquake";
        if (text.Contains("tsunami"))
            return "Tsunami";
        if (text.Contains("flood") || text.Contains("flooding"))
            return "Flood";
        if (text.Contains("cyclone") || text.Contains("hurricane") || text.Contains("typhoon"))
            return "TropicalCyclone";
        if (text.Contains("volcano") || text.Contains("volcanic"))
            return "Volcano";
        
        return "Unknown";
    }
} 