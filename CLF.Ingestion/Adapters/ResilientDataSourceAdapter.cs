using CLF.Shared.Models;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using System.Net.Http;

namespace CLF.Ingestion.Adapters;

/// <summary>
/// Base class for resilient data source adapters with circuit breaker and retry patterns
/// </summary>
public abstract class ResilientDataSourceAdapter : IDataSourceAdapter
{
    private readonly AsyncCircuitBreakerPolicy _circuitBreaker;
    private readonly AsyncRetryPolicy _retryPolicy;
    private readonly IHttpClientFactory _httpClientFactory;
    protected readonly ILogger _logger;

    protected ResilientDataSourceAdapter(IHttpClientFactory httpClientFactory, ILogger logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;

        // Configure circuit breaker
        _circuitBreaker = Policy
            .Handle<HttpRequestException>()
            .Or<TimeoutException>()
            .CircuitBreakerAsync(
                exceptionsAllowedBeforeBreaking: 3,
                durationOfBreak: TimeSpan.FromMinutes(2),
                onBreak: (exception, duration) =>
                {
                    _logger.LogWarning("Circuit breaker opened for {SourceName} for {Duration}", 
                        SourceName, duration);
                },
                onReset: () =>
                {
                    _logger.LogInformation("Circuit breaker reset for {SourceName}", SourceName);
                });

        // Configure retry policy
        _retryPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TimeoutException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt => 
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // Exponential backoff
                onRetry: (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning("Retry {RetryCount} for {SourceName} after {Delay}ms due to {Exception}", 
                        retryCount, SourceName, timeSpan.TotalMilliseconds, exception.Message);
                });
    }

    public abstract string SourceName { get; }
    public abstract string SourceType { get; }

    public async Task<List<RawData>> FetchDataAsync(ExternalDataSource source)
    {
        return await _circuitBreaker.ExecuteAsync(async () =>
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Fetching data from {SourceName} for source: {SourceId}", 
                    SourceName, source.Name);

                var client = _httpClientFactory.CreateClient(GetHttpClientName());
                var result = await FetchDataInternalAsync(client, source);

                _logger.LogInformation("Successfully fetched {Count} records from {SourceName}", 
                    result.Count, SourceName);

                return result;
            });
        });
    }

    public async Task<bool> ValidateConnectionAsync(ExternalDataSource source)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(async () =>
            {
                var client = _httpClientFactory.CreateClient(GetHttpClientName());
                return await ValidateConnectionInternalAsync(client, source);
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating connection for {SourceName}", SourceName);
            return false;
        }
    }

    /// <summary>
    /// Get the HTTP client name for this adapter
    /// </summary>
    protected abstract string GetHttpClientName();

    /// <summary>
    /// Fetch data from the external source using the provided HTTP client
    /// </summary>
    protected abstract Task<List<RawData>> FetchDataInternalAsync(HttpClient client, ExternalDataSource source);

    /// <summary>
    /// Validate connection to the external source using the provided HTTP client
    /// </summary>
    protected abstract Task<bool> ValidateConnectionInternalAsync(HttpClient client, ExternalDataSource source);

    /// <summary>
    /// Get circuit breaker status for monitoring
    /// </summary>
    public CircuitState GetCircuitBreakerState()
    {
        return _circuitBreaker.CircuitState;
    }

    /// <summary>
    /// Reset circuit breaker manually if needed
    /// </summary>
    public void ResetCircuitBreaker()
    {
        _circuitBreaker.Reset();
    }
} 