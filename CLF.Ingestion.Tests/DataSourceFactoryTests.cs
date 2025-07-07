using CLF.Ingestion.Factories;
using CLF.Ingestion.Adapters;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Shared.Models;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace CLF.Ingestion.Tests;

public class DataSourceFactoryTests : TestBase
{
    [Fact]
    public void Constructor_ShouldRegisterAllAdapters()
    {
        // Arrange & Act
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Assert
        factory.Should().NotBeNull();
        factory.GetSupportedSourceTypes().Should().Contain("NASA_FIRMS");
        factory.GetSupportedSourceTypes().Should().Contain("USGS");
        factory.GetSupportedSourceTypes().Should().Contain("GDACS");
    }

    [Fact]
    public void CreateAdapter_WithValidSourceType_ShouldReturnAdapter()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();
        var source = new ExternalDataSource { Type = "NASA_FIRMS" };

        // Act
        var adapter = factory.CreateAdapter(source);

        // Assert
        adapter.Should().NotBeNull();
        adapter.Should().BeOfType<NasaFirmsAdapter>();
    }

    [Fact]
    public void CreateAdapter_WithInvalidSourceType_ShouldThrowException()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();
        var source = new ExternalDataSource { Type = "INVALID_TYPE" };

        // Act & Assert
        var action = () => factory.CreateAdapter(source);
        action.Should().Throw<NotSupportedException>()
            .WithMessage("*Unsupported source type: INVALID_TYPE*");
    }

    [Fact]
    public void GetGrainType_WithValidSourceType_ShouldReturnGrainType()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act
        var grainType = factory.GetGrainType("NASA_FIRMS");

        // Assert
        grainType.Should().Be(typeof(INasaFirmsIngestionGrain));
    }

    [Fact]
    public void GetGrainType_WithInvalidSourceType_ShouldThrowException()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act & Assert
        var action = () => factory.GetGrainType("INVALID_TYPE");
        action.Should().Throw<NotSupportedException>()
            .WithMessage("*Unsupported source type: INVALID_TYPE*");
    }

    [Theory]
    [InlineData("NASA_FIRMS", true)]
    [InlineData("USGS", true)]
    [InlineData("GDACS", true)]
    [InlineData("TWITTER", true)]
    [InlineData("CASSIA_USER_REPORT", true)]
    [InlineData("INVALID_TYPE", false)]
    public void IsSourceTypeSupported_ShouldReturnCorrectResult(string sourceType, bool expected)
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act
        var result = factory.IsSourceTypeSupported(sourceType);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void GetAdapterInfo_WithValidSourceType_ShouldReturnInfo()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act
        var info = factory.GetAdapterInfo("NASA_FIRMS");

        // Assert
        info.Should().NotBeNull();
        info.SourceType.Should().Be("NASA_FIRMS");
        info.AdapterType.Should().Be("NasaFirmsAdapter");
        info.GrainType.Should().Be("INasaFirmsIngestionGrain");
        info.IsSupported.Should().BeTrue();
    }

    [Fact]
    public void GetAdapterInfo_WithInvalidSourceType_ShouldThrowException()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act & Assert
        var action = () => factory.GetAdapterInfo("INVALID_TYPE");
        action.Should().Throw<NotSupportedException>()
            .WithMessage("*Unsupported source type: INVALID_TYPE*");
    }

    [Fact]
    public void GetAvailableAdapterTypes_ShouldReturnAllAdapterTypes()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act
        var adapterTypes = factory.GetAvailableAdapterTypes().ToList();

        // Assert
        adapterTypes.Should().NotBeEmpty();
        adapterTypes.Should().Contain("NASA_FIRMS");
        adapterTypes.Should().Contain("USGS");
        adapterTypes.Should().Contain("GDACS");
        adapterTypes.Should().Contain("TWITTER");
        adapterTypes.Should().Contain("CASSIA_USER_REPORT");
    }

    [Fact]
    public void GetSupportedSourceTypes_ShouldReturnAllSupportedTypes()
    {
        // Arrange
        SetupTestCluster();
        var factory = GetDataSourceFactory();

        // Act
        var supportedTypes = factory.GetSupportedSourceTypes().ToList();

        // Assert
        supportedTypes.Should().NotBeEmpty();
        supportedTypes.Should().Contain("NASA_FIRMS");
        supportedTypes.Should().Contain("USGS");
        supportedTypes.Should().Contain("GDACS");
        supportedTypes.Should().Contain("TWITTER");
        supportedTypes.Should().Contain("CASSIA_USER_REPORT");
    }
} 