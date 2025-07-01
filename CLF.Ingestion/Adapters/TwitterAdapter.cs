using CLF.Shared.Models;
using System.Text.Json;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// Twitter adapter for social media disaster reports
/// Provides real-time disaster information from social media
/// </summary>
public class TwitterAdapter : IDataSourceAdapter
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TwitterAdapter> _logger;
    private readonly string _baseUrl = "https://api.twitter.com/2/tweets/search/recent";

    public TwitterAdapter(HttpClient httpClient, ILogger<TwitterAdapter> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public string SourceName => "TWITTER_DISASTER_REPORTS";
    public string SourceType => "Social_Media_Reports";

    public async Task<List<RawData>> FetchDataAsync(ExternalDataSource source)
    {
        try
        {
            _logger.LogInformation("Fetching Twitter disaster reports for source: {SourceName}", source.Name);

            // Extract configuration parameters
            var query = source.Configuration.GetValueOrDefault("Query", "disaster OR earthquake OR flood OR fire");
            var maxResults = source.Configuration.GetValueOrDefault("MaxResults", "100");
            var bearerToken = source.Configuration.GetValueOrDefault("BearerToken", "");

            if (string.IsNullOrEmpty(bearerToken))
            {
                _logger.LogWarning("Twitter Bearer Token is missing");
                return new List<RawData>();
            }

            // Build API URL
            var url = $"{_baseUrl}?query={Uri.EscapeDataString(query)}&max_results={maxResults}&tweet.fields=created_at,geo,author_id&expansions=author_id&user.fields=username,name,location";

            // Set up HTTP request with authorization
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);

            // Fetch data from Twitter API
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonContent = await response.Content.ReadAsStringAsync();
            
            // Parse Twitter JSON and convert to RawData
            var rawDataList = ParseTwitterJson(jsonContent, source.Id);

            _logger.LogInformation("Successfully fetched {Count} Twitter disaster report records", rawDataList.Count);

            return rawDataList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Twitter disaster reports for source: {SourceName}", source.Name);
            throw;
        }
    }

    public async Task<bool> ValidateConnectionAsync(ExternalDataSource source)
    {
        try
        {
            var bearerToken = source.Configuration.GetValueOrDefault("BearerToken", "");
            if (string.IsNullOrEmpty(bearerToken))
            {
                _logger.LogWarning("Twitter Bearer Token is missing");
                return false;
            }

            // Test connection with a minimal request
            var testUrl = $"{_baseUrl}?query=test&max_results=1";
            var request = new HttpRequestMessage(HttpMethod.Get, testUrl);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
            
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Twitter connection");
            return false;
        }
    }

    private List<RawData> ParseTwitterJson(string jsonContent, Guid sourceId)
    {
        var rawDataList = new List<RawData>();

        try
        {
            using var document = JsonDocument.Parse(jsonContent);
            var root = document.RootElement;

            if (root.TryGetProperty("data", out var tweets))
            {
                foreach (var tweet in tweets.EnumerateArray())
                {
                    try
                    {
                        var rawData = new RawData
                        {
                            Id = Guid.NewGuid(),
                            SourceId = sourceId,
                            DataType = "TWITTER_DISASTER_REPORT",
                            RawContent = tweet.GetRawText(),
                            Metadata = new Dictionary<string, object>
                            {
                                { "SourceName", "TWITTER_DISASTER_REPORTS" },
                                { "ParsedAt", DateTime.UtcNow }
                            },
                            Status = DataIngestionStatus.Completed,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "TwitterAdapter"
                        };

                        // Extract tweet metadata
                        if (tweet.TryGetProperty("id", out var id))
                            rawData.Metadata["TweetId"] = id.GetString() ?? "";
                        
                        if (tweet.TryGetProperty("text", out var text))
                            rawData.Metadata["Text"] = text.GetString() ?? "";
                        
                        if (tweet.TryGetProperty("created_at", out var createdAt))
                            rawData.Metadata["CreatedAt"] = createdAt.GetString() ?? "";
                        
                        if (tweet.TryGetProperty("author_id", out var authorId))
                            rawData.Metadata["AuthorId"] = authorId.GetString() ?? "";

                        // Extract geo information if available
                        if (tweet.TryGetProperty("geo", out var geo))
                        {
                            if (geo.TryGetProperty("coordinates", out var coordinates))
                            {
                                if (coordinates.TryGetProperty("coordinates", out var coords))
                                {
                                    var coordArray = coords.EnumerateArray().ToArray();
                                    if (coordArray.Length >= 2)
                                    {
                                        rawData.Metadata["Longitude"] = coordArray[0].GetDouble();
                                        rawData.Metadata["Latitude"] = coordArray[1].GetDouble();
                                    }
                                }
                            }
                        }

                        // Determine disaster type from tweet text
                        var tweetText = tweet.TryGetProperty("text", out var textProp) ? textProp.GetString() ?? "" : "";
                        var disasterType = DetermineDisasterType(tweetText);
                        rawData.Metadata["DisasterType"] = disasterType;

                        // Extract user information if available
                        if (root.TryGetProperty("includes", out var includes))
                        {
                            if (includes.TryGetProperty("users", out var users))
                            {
                                var authorId = tweet.TryGetProperty("author_id", out var authorIdProp) ? authorIdProp.GetString() : "";
                                var user = users.EnumerateArray().FirstOrDefault(u => 
                                    u.TryGetProperty("id", out var userId) && userId.GetString() == authorId);
                                
                                if (user.ValueKind != JsonValueKind.Undefined)
                                {
                                    if (user.TryGetProperty("username", out var username))
                                        rawData.Metadata["Username"] = username.GetString() ?? "";
                                    
                                    if (user.TryGetProperty("name", out var name))
                                        rawData.Metadata["DisplayName"] = name.GetString() ?? "";
                                    
                                    if (user.TryGetProperty("location", out var location))
                                        rawData.Metadata["UserLocation"] = location.GetString() ?? "";
                                }
                            }
                        }

                        rawDataList.Add(rawData);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error parsing Twitter tweet");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing Twitter JSON content");
        }

        return rawDataList;
    }

    private string DetermineDisasterType(string tweetText)
    {
        var text = tweetText.ToLower();
        
        if (text.Contains("earthquake") || text.Contains("quake") || text.Contains("seismic"))
            return "Earthquake";
        if (text.Contains("flood") || text.Contains("flooding") || text.Contains("water"))
            return "Flood";
        if (text.Contains("fire") || text.Contains("burning") || text.Contains("smoke"))
            return "Fire";
        if (text.Contains("tsunami") || text.Contains("wave"))
            return "Tsunami";
        if (text.Contains("volcano") || text.Contains("volcanic") || text.Contains("eruption"))
            return "Volcano";
        if (text.Contains("cyclone") || text.Contains("hurricane") || text.Contains("typhoon") || text.Contains("storm"))
            return "TropicalCyclone";
        if (text.Contains("landslide") || text.Contains("mudslide"))
            return "Landslide";
        
        return "Unknown";
    }

    private async Task<ETLProcessingResult> ProcessRawDataInternalAsync(RawData rawData)
    {
        try
        {
            // 1. Deduplicate (pseudo-code)
            var eventKey = $"{rawData.Metadata["Latitude"]}_{rawData.Metadata["Longitude"]}_{rawData.Metadata["Time"]}";
            if (await IsDuplicateAsync(eventKey)) return new ETLProcessingResult { Success = false, RawDataId = rawData.Id };

            // 2. Normalize
            var cleanData = Normalize(rawData);

            // 3. Enrich
            var enrichedData = await EnrichAsync(cleanData);

            // 4. Prepare outputs
            var events = ExtractEvents(enrichedData);
            var timeSeries = ExtractTimeSeries(enrichedData);
            var geoData = ExtractGeoData(enrichedData);

            // 5. Update metrics
            _status.SuccessfullyProcessed++;
            _statistics.SuccessfulRecords++;

            return new ETLProcessingResult
            {
                Success = true,
                RawDataId = rawData.Id,
                CleanDataId = enrichedData.Id,
                Events = events,
                TimeSeriesData = timeSeries,
                GeoData = geoData,
                ProcessedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ETL error for RawDataId: {RawDataId}", rawData.Id);
            _status.FailedProcessing++;
            _statistics.FailedRecords++;
            return new ETLProcessingResult { Success = false, RawDataId = rawData.Id, ErrorMessage = ex.Message };
        }
    }

    public async Task<EventStoreResult> StoreProcessedDataAsync(ETLProcessingResult processedData)
    {
        try
        {
            // Example: Write to PostGIS, TimescaleDB, or Blob Storage
            await _dbContext.Events.AddRangeAsync(processedData.Events);
            await _dbContext.TimeSeriesData.AddRangeAsync(processedData.TimeSeriesData);
            await _dbContext.GeoData.AddRangeAsync(processedData.GeoData);
            await _dbContext.SaveChangesAsync();

            _status.SuccessfullyStored++;
            _statistics.SuccessfulStores++;
            return new EventStoreResult { Success = true, ProcessedDataId = processedData.CleanDataId ?? Guid.NewGuid(), StoredAt = DateTime.UtcNow };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Storage error for CleanDataId: {CleanDataId}", processedData.CleanDataId);
            _status.FailedStorage++;
            _statistics.FailedStores++;
            return new EventStoreResult { Success = false, ProcessedDataId = processedData.CleanDataId ?? Guid.NewGuid(), ErrorMessage = ex.Message, StoredAt = DateTime.UtcNow };
        }
    }
} 