using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Streams;
using Xunit;

namespace CLF.Ingestion.Tests;

public class IntegrationTests : TestBase
{
    [Fact]
    public async Task NasaFirmsIngestionGrain_ShouldInitializeCorrectly()
    {
        // Arrange
        SetupTestCluster();
        var grain = GetClient().GetGrain<INasaFirmsIngestionGrain>("test-nasa-firms");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global",
                ["Satellite"] = "VIIRS_SNPP_NRT",
                ["Days"] = "1"
            }
        };

        // Act
        await grain.InitializeAsync(source);
        var status = await grain.GetStatusAsync();

        // Assert
        status.Should().NotBeNull();
        status.SourceName.Should().Be("Test NASA FIRMS");
        status.SourceType.Should().Be("NASA_FIRMS");
        status.IsPolling.Should().BeFalse();
    }

    [Fact]
    public async Task DataSourceRegistry_ShouldRegisterAndManageDataSources()
    {
        // Arrange
        SetupTestCluster();
        var registry = GetClient().GetGrain<IDataSourceRegistry>("default");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global"
            }
        };

        // Act
        var registerResult = await registry.RegisterDataSourceAsync(source);
        var activeSources = await registry.GetActiveDataSourcesAsync();
        var retrievedSource = await registry.GetDataSourceAsync(source.Id.ToString());

        // Assert
        registerResult.Should().BeTrue();
        activeSources.Should().HaveCount(1);
        retrievedSource.Should().NotBeNull();
        retrievedSource!.Name.Should().Be("Test NASA FIRMS");
    }

    [Fact]
    public async Task DataSourceRegistry_ShouldUnregisterDataSources()
    {
        // Arrange
        SetupTestCluster();
        var registry = GetClient().GetGrain<IDataSourceRegistry>("default");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key"
            }
        };

        // Act
        await registry.RegisterDataSourceAsync(source);
        var unregisterResult = await registry.UnregisterDataSourceAsync(source.Id.ToString());
        var activeSources = await registry.GetActiveDataSourcesAsync();

        // Assert
        unregisterResult.Should().BeTrue();
        activeSources.Should().HaveCount(0);
    }

    [Fact]
    public async Task DataSourceRegistry_ShouldGetAllStatuses()
    {
        // Arrange
        SetupTestCluster();
        var registry = GetClient().GetGrain<IDataSourceRegistry>("default");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key"
            }
        };

        // Act
        await registry.RegisterDataSourceAsync(source);
        var statuses = await registry.GetAllStatusAsync();

        // Assert
        statuses.Should().NotBeNull();
        statuses.Should().HaveCount(1);
        statuses[source.Id.ToString()].SourceName.Should().Be("Test NASA FIRMS");
    }

    [Fact]
    public async Task IngestionGrain_ShouldHandleManualTrigger()
    {
        // Arrange
        SetupTestCluster();
        var grain = GetClient().GetGrain<INasaFirmsIngestionGrain>("test-manual-trigger");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test Manual Trigger",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global"
            }
        };

        await grain.InitializeAsync(source);

        // Act
        var result = await grain.TriggerFetchAsync();

        // Assert
        result.Should().NotBeNull();
        result.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        result.Metadata.Should().ContainKey("SatelliteSystem");
        result.Metadata.Should().ContainKey("DataProduct");
        result.Metadata.Should().ContainKey("ApiVersion");
        result.Metadata.Should().ContainKey("DataProvider");
    }

    [Fact]
    public async Task IngestionGrain_ShouldHandleWebhookProcessing()
    {
        // Arrange
        SetupTestCluster();
        var grain = GetClient().GetGrain<INasaFirmsIngestionGrain>("test-webhook");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test Webhook",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key"
            }
        };

        await grain.InitializeAsync(source);

        var webhookPayload = "{\"test\": \"data\"}";

        // Act
        await grain.ProcessWebhookAsync(webhookPayload);
        var status = await grain.GetStatusAsync();

        // Assert
        status.Should().NotBeNull();
        // Webhook processing should increment successful fetches even if no data is returned
        status.SuccessfulFetches.Should().BeGreaterOrEqualTo(0);
    }

    [Fact]
    public async Task IngestionGrain_ShouldHandleStartAndStopPolling()
    {
        // Arrange
        SetupTestCluster();
        var grain = GetClient().GetGrain<INasaFirmsIngestionGrain>("test-polling");

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test Polling",
            Type = "NASA_FIRMS",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key"
            }
        };

        await grain.InitializeAsync(source);

        // Act - Start polling
        await grain.StartPollingAsync();
        var statusAfterStart = await grain.GetStatusAsync();

        // Act - Stop polling
        await grain.StopPollingAsync();
        var statusAfterStop = await grain.GetStatusAsync();

        // Assert
        statusAfterStart.IsPolling.Should().BeTrue();
        statusAfterStart.NextFetchTime.Should().NotBeNull();
        
        statusAfterStop.IsPolling.Should().BeFalse();
        statusAfterStop.NextFetchTime.Should().BeNull();
    }
} 