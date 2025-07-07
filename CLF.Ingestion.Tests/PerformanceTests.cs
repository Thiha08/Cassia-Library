using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Streams;
using Xunit;

namespace CLF.Ingestion.Tests;

public class PerformanceTests : TestBase
{
    [Fact]
    public async Task MultipleGrains_ShouldHandleConcurrentOperations()
    {
        // Arrange
        SetupTestCluster();
        var client = GetClient();
        var tasks = new List<Task<IngestionResult>>();

        // Create multiple grains
        var grain1 = client.GetGrain<INasaFirmsIngestionGrain>("test-grain-1");
        var grain2 = client.GetGrain<INasaFirmsIngestionGrain>("test-grain-2");
        var grain3 = client.GetGrain<INasaFirmsIngestionGrain>("test-grain-3");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Performance Test Source",
            Type = "nasa-firms",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global"
            }
        };

        await grain1.InitializeAsync(source);
        await grain2.InitializeAsync(source);
        await grain3.InitializeAsync(source);

        // Act - Trigger concurrent operations
        tasks.Add(grain1.TriggerFetchAsync());
        tasks.Add(grain2.TriggerFetchAsync());
        tasks.Add(grain3.TriggerFetchAsync());

        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().HaveCount(3);
        results.Should().OnlyContain(r => r.Success);
        results.Should().OnlyContain(r => r.ProcessedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task StreamProcessing_ShouldHandleHighVolumeData()
    {
        // Arrange
        SetupTestCluster();
        var client = GetClient();
        var streamProvider = client.GetStreamProvider("IngestionStreamProvider");
        var stream = streamProvider.GetStream<RawData>("test-stream", "test-namespace");

        var receivedData = new List<RawData>();
        var subscription = await stream.SubscribeAsync(new TestStreamObserver(receivedData));

        // Act - Publish multiple data items
        var tasks = new List<Task>();
        for (int i = 0; i < 100; i++)
        {
            var rawData = new RawData
            {
                Id = Guid.NewGuid(),
                SourceId = Guid.NewGuid(),
                DataType = "test-data",
                RawContent = $"{{ \"test\": \"data-{i}\" }}",
                Metadata = new Dictionary<string, object>
                {
                    ["Index"] = i,
                    ["Timestamp"] = DateTime.UtcNow
                },
                Status = DataIngestionStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "PerformanceTest"
            };

            tasks.Add(stream.OnNextAsync(rawData));
        }

        await Task.WhenAll(tasks);

        // Wait for processing
        await Task.Delay(2000);

        // Assert
        receivedData.Should().HaveCount(100);
        receivedData.Should().OnlyContain(d => !string.IsNullOrEmpty(d.RawContent));
        receivedData.Should().OnlyContain(d => d.Status == DataIngestionStatus.Pending);

        // Cleanup
        await subscription.UnsubscribeAsync();
    }

    [Fact]
    public async Task DatabaseOperations_ShouldHandleBulkOperations()
    {
        // Arrange
        SetupTestCluster();
        var dbContext = GetDbContext();

        // Act - Create multiple data sources and raw data
        var sources = new List<ExternalDataSource>();
        var rawDataList = new List<RawData>();

        for (int i = 0; i < 50; i++)
        {
            var source = new ExternalDataSource
            {
                Id = Guid.NewGuid(),
                Name = $"Test Source {i}",
                Type = "nasa-firms",
                PollingInterval = TimeSpan.FromMinutes(5),
                Configuration = new Dictionary<string, string>
                {
                    ["ApiKey"] = "test-key",
                    ["Area"] = "global"
                },
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "PerformanceTest"
            };

            sources.Add(source);
            dbContext.ExternalDataSources.Add(source);

            // Create raw data for each source
            for (int j = 0; j < 10; j++)
            {
                var rawData = new RawData
                {
                    Id = Guid.NewGuid(),
                    SourceId = source.Id,
                    DataType = "test-data",
                    RawContent = $"{{ \"source\": \"{source.Name}\", \"index\": {j} }}",
                    Metadata = new Dictionary<string, object>
                    {
                        ["SourceIndex"] = i,
                        ["DataIndex"] = j,
                        ["Timestamp"] = DateTime.UtcNow
                    },
                    Status = DataIngestionStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "PerformanceTest"
                };

                rawDataList.Add(rawData);
                dbContext.RawData.Add(rawData);
            }
        }

        var startTime = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();
        var endTime = DateTime.UtcNow;

        // Assert
        var duration = endTime - startTime;
        duration.Should().BeLessThan(TimeSpan.FromSeconds(5)); // Should complete within 5 seconds

        var savedSources = await dbContext.ExternalDataSources.CountAsync();
        var savedRawData = await dbContext.RawData.CountAsync();

        savedSources.Should().Be(50);
        savedRawData.Should().Be(500);
    }

    [Fact]
    public async Task GrainActivation_ShouldBeFast()
    {
        // Arrange
        SetupTestCluster();
        var client = GetClient();
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        // Act - Activate multiple grains
        var grains = new List<INasaFirmsIngestionGrain>();
        for (int i = 0; i < 100; i++)
        {
            var grain = client.GetGrain<INasaFirmsIngestionGrain>($"test-grain-{i}");
            grains.Add(grain);
        }

        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000); // Should complete within 1 second
        grains.Should().HaveCount(100);
    }

    [Fact]
    public async Task MemoryUsage_ShouldBeReasonable()
    {
        // Arrange
        SetupTestCluster();
        var client = GetClient();
        var initialMemory = GC.GetTotalMemory(true);

        // Act - Create and use multiple grains
        var grains = new List<INasaFirmsIngestionGrain>();
        for (int i = 0; i < 50; i++)
        {
            var grain = client.GetGrain<INasaFirmsIngestionGrain>($"memory-test-{i}");
            var source = new ExternalDataSource
            {
                Id = Guid.NewGuid(),
                Name = $"Memory Test Source {i}",
                Type = "nasa-firms",
                PollingInterval = TimeSpan.FromMinutes(5),
                Configuration = new Dictionary<string, string>
                {
                    ["ApiKey"] = "test-key",
                    ["Area"] = "global"
                }
            };

            await grain.InitializeAsync(source);
            grains.Add(grain);
        }

        // Trigger some operations
        var tasks = grains.Select(g => g.TriggerFetchAsync()).ToArray();
        await Task.WhenAll(tasks);

        var finalMemory = GC.GetTotalMemory(true);
        var memoryIncrease = finalMemory - initialMemory;

        // Assert
        memoryIncrease.Should().BeLessThan(50 * 1024 * 1024); // Should use less than 50MB additional memory
    }
}

/// <summary>
/// Test stream observer for performance testing
/// </summary>
public class TestStreamObserver : IAsyncObserver<RawData>
{
    private readonly List<RawData> _receivedData;

    public TestStreamObserver(List<RawData> receivedData)
    {
        _receivedData = receivedData;
    }

    public Task OnNextAsync(RawData item, StreamSequenceToken? token = null)
    {
        _receivedData.Add(item);
        return Task.CompletedTask;
    }

    public Task OnCompletedAsync()
    {
        return Task.CompletedTask;
    }

    public Task OnErrorAsync(Exception ex)
    {
        return Task.CompletedTask;
    }
} 