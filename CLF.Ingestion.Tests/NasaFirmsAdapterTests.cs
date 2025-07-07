using CLF.Ingestion.Adapters;
using CLF.Shared.Models;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;
using Xunit;

namespace CLF.Ingestion.Tests;

public class NasaFirmsAdapterTests : TestBase
{
    private readonly Mock<HttpMessageHandler> _mockHttpHandler;
    private readonly HttpClient _httpClient;

    public NasaFirmsAdapterTests()
    {
        _mockHttpHandler = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_mockHttpHandler.Object);
    }

    [Fact]
    public void Constructor_ShouldCreateAdapterWithCorrectProperties()
    {
        // Arrange
        SetupTestCluster();
        var httpClientFactory = ServiceProvider!.GetRequiredService<IHttpClientFactory>();
        var logger = GetLogger<NasaFirmsAdapter>();

        // Act
        var adapter = new NasaFirmsAdapter(httpClientFactory, logger);

        // Assert
        adapter.Should().NotBeNull();
        adapter.SourceName.Should().Be("NASA_FIRMS");
        adapter.SourceType.Should().Be("Satellite_Fire_Detection");
    }

    [Fact]
    public async Task FetchDataAsync_WithValidResponse_ShouldReturnParsedData()
    {
        // Arrange
        SetupTestCluster();
        var httpClientFactory = ServiceProvider!.GetRequiredService<IHttpClientFactory>();
        var logger = GetLogger<NasaFirmsAdapter>();
        var adapter = new NasaFirmsAdapter(httpClientFactory, logger);

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global",
                ["Satellite"] = "VIIRS_SNPP_NRT",
                ["Days"] = "1"
            }
        };

        // Mock successful HTTP response with CSV data
        var csvData = @"latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp
45.123,-122.456,312.5,0.8,0.9,2024-01-15,1230,VIIRS_SNPP_NRT,high,2.0,295.2,45.6";

        _mockHttpHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(csvData, Encoding.UTF8, "text/csv")
            });

        // Act
        var result = await adapter.FetchDataAsync(source);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].DataType.Should().Be("NASA_FIRMS_FIRE_DETECTION");
        result[0].SourceId.Should().Be(source.Id);
    }

    [Fact]
    public async Task FetchDataAsync_WithMissingApiKey_ShouldThrowException()
    {
        // Arrange
        SetupTestCluster();
        var httpClientFactory = ServiceProvider!.GetRequiredService<IHttpClientFactory>();
        var logger = GetLogger<NasaFirmsAdapter>();
        var adapter = new NasaFirmsAdapter(httpClientFactory, logger);

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            Configuration = new Dictionary<string, string>
            {
                ["Area"] = "global",
                ["Satellite"] = "VIIRS_SNPP_NRT",
                ["Days"] = "1"
            }
        };

        // Act & Assert
        var action = () => adapter.FetchDataAsync(source);
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*NASA FIRMS API key is required*");
    }

    [Fact]
    public async Task ValidateConnectionAsync_WithValidApiKey_ShouldReturnTrue()
    {
        // Arrange
        SetupTestCluster();
        var httpClientFactory = ServiceProvider!.GetRequiredService<IHttpClientFactory>();
        var logger = GetLogger<NasaFirmsAdapter>();
        var adapter = new NasaFirmsAdapter(httpClientFactory, logger);

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key"
            }
        };

        // Mock successful HTTP response
        _mockHttpHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

        // Act
        var result = await adapter.ValidateConnectionAsync(source);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateConnectionAsync_WithInvalidApiKey_ShouldReturnFalse()
    {
        // Arrange
        SetupTestCluster();
        var httpClientFactory = ServiceProvider!.GetRequiredService<IHttpClientFactory>();
        var logger = GetLogger<NasaFirmsAdapter>();
        var adapter = new NasaFirmsAdapter(httpClientFactory, logger);

        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = "Test NASA FIRMS",
            Type = "NASA_FIRMS",
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "invalid-key"
            }
        };

        // Mock failed HTTP response
        _mockHttpHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Unauthorized));

        // Act
        var result = await adapter.ValidateConnectionAsync(source);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void GetCircuitBreakerState_ShouldReturnInitialState()
    {
        // Arrange
        SetupTestCluster();
        var httpClientFactory = ServiceProvider!.GetRequiredService<IHttpClientFactory>();
        var logger = GetLogger<NasaFirmsAdapter>();
        var adapter = new NasaFirmsAdapter(httpClientFactory, logger);

        // Act
        var state = adapter.GetCircuitBreakerState();

        // Assert
        state.Should().Be(Polly.CircuitBreaker.CircuitState.Closed);
    }

    public override void Dispose()
    {
        base.Dispose();
        _httpClient?.Dispose();
    }
} 