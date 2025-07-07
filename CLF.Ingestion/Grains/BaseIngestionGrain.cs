using Orleans;
using Orleans.Streams;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using Microsoft.Extensions.DependencyInjection;

namespace CLF.Ingestion.Grains;

/// <summary>
/// Base class for all ingestion grains providing common functionality
/// </summary>
public abstract class BaseIngestionGrain : Grain, IIngestionGrain
{
    protected ExternalDataSource? _source;
    protected IDisposable? _timer;
    protected IAsyncStream<RawData>? _stream;
    protected IngestionGrainStatus _status;
    protected readonly ILogger _logger;

    protected BaseIngestionGrain(ILogger logger)
    {
        _logger = logger;
        _status = new IngestionGrainStatus();
    }

    public override async Task OnActivateAsync(CancellationToken cancellationToken)
    {
        // Set up Orleans stream for publishing raw data
        var streamProvider = this.GetStreamProvider("IngestionStreamProvider");
        _stream = streamProvider.GetStream<RawData>(this.GetPrimaryKeyString(), GetStreamNamespace());
        
        await base.OnActivateAsync(cancellationToken);
        
        _logger.LogInformation("Activated {GrainType} with key: {GrainKey}", this.GetType().Name, this.GetPrimaryKeyString());
    }

    public override async Task OnDeactivateAsync(DeactivationReason reason, CancellationToken cancellationToken)
    {
        _timer?.Dispose();
        _timer = null;
        await base.OnDeactivateAsync(reason, cancellationToken);
        
        _logger.LogInformation("Deactivated {GrainType} with key: {GrainKey}", this.GetType().Name, this.GetPrimaryKeyString());
    }

    public virtual async Task InitializeAsync(ExternalDataSource source)
    {
        _source = source;
        _status.SourceName = source.Name;
        _status.SourceType = source.Type;
        _status.IsPolling = false;
        
        _logger.LogInformation("Initialized {GrainType} for source: {SourceName}", this.GetType().Name, source.Name);
        
        await Task.CompletedTask;
    }

    public virtual async Task StartPollingAsync()
    {
        if (_source == null)
        {
            throw new InvalidOperationException("Grain must be initialized before starting polling");
        }

        if (_status.IsPolling)
        {
            _logger.LogWarning("Polling already started for source: {SourceName}", _source.Name);
            return;
        }

        var pollingInterval = _source.PollingInterval;
        _timer = RegisterTimer(PollDataAsync, null, TimeSpan.Zero, pollingInterval);
        _status.IsPolling = true;
        _status.NextFetchTime = DateTime.UtcNow.Add(pollingInterval);

        _logger.LogInformation("Started polling for source: {SourceName} with interval: {Interval}", 
            _source.Name, pollingInterval);
        
        await Task.CompletedTask;
    }

    public virtual async Task StopPollingAsync()
    {
        _timer?.Dispose();
        _timer = null;
        _status.IsPolling = false;
        _status.NextFetchTime = null;

        _logger.LogInformation("Stopped polling for source: {SourceName}", _source?.Name);
        
        await Task.CompletedTask;
    }

    public virtual async Task ProcessWebhookAsync(string payload)
    {
        try
        {
            _logger.LogInformation("Processing webhook for source: {SourceName}", _source?.Name);

            var rawData = await ProcessWebhookPayloadAsync(payload);
            if (rawData != null)
            {
                await PublishToStreamAsync(rawData);
                _status.SuccessfulFetches++;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook for source: {SourceName}", _source?.Name);
            _status.FailedFetches++;
            _status.LastError = ex.Message;
        }
        
        await Task.CompletedTask;
    }

    public virtual async Task<IngestionGrainStatus> GetStatusAsync()
    {
        _status.TotalFetches = _status.SuccessfulFetches + _status.FailedFetches;
        return await Task.FromResult(_status);
    }

    public virtual async Task<IngestionResult> TriggerFetchAsync()
    {
        try
        {
            _logger.LogInformation("Manually triggering fetch for source: {SourceName}", _source?.Name);

            var result = await PollDataAsync(null);
            return new IngestionResult
            {
                Success = true,
                RecordsProcessed = result.RecordsProcessed,
                RecordsFailed = result.RecordsFailed,
                ProcessedAt = DateTime.UtcNow,
                Metadata = result.Metadata
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in manual fetch for source: {SourceName}", _source?.Name);
            return new IngestionResult
            {
                Success = false,
                ErrorMessage = ex.Message,
                ProcessedAt = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// Poll data from the external source
    /// </summary>
    protected virtual async Task<IngestionResult> PollDataAsync(object? state)
    {
        if (_source == null)
        {
            return new IngestionResult { Success = false, ErrorMessage = "Source not initialized" };
        }

        try
        {
            _logger.LogInformation("Polling data from source: {SourceName}", _source.Name);

            var adapter = GetAdapter();
            var rawDataList = await adapter.FetchDataAsync(_source);

            var processedCount = 0;
            var failedCount = 0;

            foreach (var rawData in rawDataList)
            {
                try
                {
                    await PublishToStreamAsync(rawData);
                    processedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error publishing raw data: {DataId}", rawData.Id);
                    failedCount++;
                }
            }

            _status.LastFetchTime = DateTime.UtcNow;
            _status.SuccessfulFetches++;
            _status.NextFetchTime = DateTime.UtcNow.Add(_source.PollingInterval);

            _logger.LogInformation("Successfully polled {Processed} records from source: {SourceName}", 
                processedCount, _source.Name);

            return new IngestionResult
            {
                Success = true,
                RecordsProcessed = processedCount,
                RecordsFailed = failedCount,
                ProcessedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, object>
                {
                    { "SourceName", _source.Name },
                    { "SourceType", _source.Type }
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error polling data from source: {SourceName}", _source.Name);
            _status.FailedFetches++;
            _status.LastError = ex.Message;

            return new IngestionResult
            {
                Success = false,
                ErrorMessage = ex.Message,
                ProcessedAt = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// Publish raw data to Orleans stream
    /// </summary>
    protected virtual async Task PublishToStreamAsync(RawData rawData)
    {
        if (_stream != null)
        {
            await _stream.OnNextAsync(rawData);
            _logger.LogDebug("Published raw data {DataId} to stream", rawData.Id);
        }
    }

    /// <summary>
    /// Get the appropriate adapter for this data source
    /// </summary>
    protected abstract IDataSourceAdapter GetAdapter();

    /// <summary>
    /// Get the stream namespace for this grain type
    /// </summary>
    protected abstract string GetStreamNamespace();

    /// <summary>
    /// Process webhook payload (override in derived classes)
    /// </summary>
    protected virtual async Task<RawData?> ProcessWebhookPayloadAsync(string payload)
    {
        // Default implementation - override in derived classes
        return await Task.FromResult<RawData?>(null);
    }
} 