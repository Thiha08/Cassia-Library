using CLF.Ingestion.Controllers;
using CLF.Shared.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Orleans;
using Xunit;

namespace CLF.Ingestion.Tests;

public class ControllerTests : TestBase
{
    private readonly Mock<IClusterClient> _mockClusterClient;
    private readonly Mock<ILogger<IngestionController>> _mockLogger;
    private readonly Mock<ILogger<ClusterController>> _mockClusterLogger;
    private readonly Mock<ILogger<WebhookController>> _mockWebhookLogger;

    public ControllerTests()
    {
        _mockClusterClient = new Mock<IClusterClient>();
        _mockLogger = new Mock<ILogger<IngestionController>>();
        _mockClusterLogger = new Mock<ILogger<ClusterController>>();
        _mockWebhookLogger = new Mock<ILogger<WebhookController>>();
    }

    [Fact]
    public async Task IngestionController_GetDataSources_ShouldReturnOk()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var testSource = await CreateTestDataSourceAsync("Test Source", "nasa-firms");

        // Act
        var result = await controller.GetDataSources();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task IngestionController_RegisterDataSource_ShouldReturnCreated()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var source = new ExternalDataSource
        {
            Name = "Test NASA FIRMS",
            Type = "nasa-firms",
            PollingInterval = TimeSpan.FromMinutes(5),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global"
            }
        };

        // Act
        var result = await controller.RegisterDataSource(source);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result as CreatedAtActionResult;
        createdResult!.Value.Should().BeOfType<ExternalDataSource>();
    }

    [Fact]
    public async Task IngestionController_GetDataSource_ShouldReturnNotFound_WhenSourceDoesNotExist()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await controller.GetDataSource(nonExistentId);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task IngestionController_GetDataSource_ShouldReturnOk_WhenSourceExists()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var testSource = await CreateTestDataSourceAsync("Test Source", "nasa-firms");

        // Act
        var result = await controller.GetDataSource(testSource.Id);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeOfType<ExternalDataSource>();
    }

    [Fact]
    public async Task IngestionController_GetIngestionRecords_ShouldReturnOk()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var testSource = await CreateTestDataSourceAsync("Test Source", "nasa-firms");
        await CreateTestRawDataAsync(testSource.Id, "test-data");

        // Act
        var result = await controller.GetIngestionRecords();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task IngestionController_GetIngestionRecord_ShouldReturnNotFound_WhenRecordDoesNotExist()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await controller.GetIngestionRecord(nonExistentId);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task IngestionController_GetIngestionRecord_ShouldReturnOk_WhenRecordExists()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var testSource = await CreateTestDataSourceAsync("Test Source", "nasa-firms");
        var testRecord = await CreateTestRawDataAsync(testSource.Id, "test-data");

        // Act
        var result = await controller.GetIngestionRecord(testRecord.Id);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeOfType<RawData>();
    }

    [Fact]
    public async Task IngestionController_RetryIngestion_ShouldReturnBadRequest_WhenRecordIsNotFailed()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var testSource = await CreateTestDataSourceAsync("Test Source", "nasa-firms");
        var testRecord = await CreateTestRawDataAsync(testSource.Id, "test-data");
        testRecord.Status = DataIngestionStatus.Completed;
        await GetDbContext().SaveChangesAsync();

        // Act
        var result = await controller.RetryIngestion(testRecord.Id);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task IngestionController_RetryIngestion_ShouldReturnOk_WhenRecordIsFailed()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        var testSource = await CreateTestDataSourceAsync("Test Source", "nasa-firms");
        var testRecord = await CreateTestRawDataAsync(testSource.Id, "test-data");
        testRecord.Status = DataIngestionStatus.Failed;
        await GetDbContext().SaveChangesAsync();

        // Act
        var result = await controller.RetryIngestion(testRecord.Id);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task IngestionController_GetHealth_ShouldReturnOk()
    {
        // Arrange
        SetupTestCluster();
        var controller = new IngestionController(
            GetDbContext(),
            _mockLogger.Object,
            ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
            _mockClusterClient.Object,
            null!);

        // Act
        var result = controller.GetHealth();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public void ClusterController_GetClusterHealth_ShouldReturnOk()
    {
        // Arrange
        var controller = new ClusterController(_mockClusterLogger.Object, _mockClusterClient.Object);

        // Act
        var result = controller.GetClusterHealth();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task ClusterController_GetActiveGrains_ShouldReturnOk()
    {
        // Arrange
        var controller = new ClusterController(_mockClusterLogger.Object, _mockClusterClient.Object);

        // Act
        var result = await controller.GetActiveGrains();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task ClusterController_GetGrainStatistics_ShouldReturnOk()
    {
        // Arrange
        var controller = new ClusterController(_mockClusterLogger.Object, _mockClusterClient.Object);

        // Act
        var result = await controller.GetGrainStatistics();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task WebhookController_HandleNasaFirmsWebhook_ShouldReturnOk()
    {
        // Arrange
        SetupTestCluster();
        var controller = new WebhookController(_mockWebhookLogger.Object, _mockClusterClient.Object);

        var payload = new { test = "data" };

        // Act
        var result = await controller.HandleNasaFirmsWebhook(payload);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task WebhookController_HandleGenericWebhook_ShouldReturnOk()
    {
        // Arrange
        SetupTestCluster();
        var controller = new WebhookController(_mockWebhookLogger.Object, _mockClusterClient.Object);

        var payload = new { test = "data" };
        var sourceType = "nasa-firms";

        // Act
        var result = await controller.HandleGenericWebhook(sourceType, payload);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task WebhookController_HandleGenericWebhook_ShouldReturnError_WhenSourceTypeIsInvalid()
    {
        // Arrange
        SetupTestCluster();
        var controller = new WebhookController(_mockWebhookLogger.Object, _mockClusterClient.Object);

        var payload = new { test = "data" };
        var invalidSourceType = "invalid-source-type";

        // Act
        var result = await controller.HandleGenericWebhook(invalidSourceType, payload);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var errorResult = result as ObjectResult;
        errorResult!.StatusCode.Should().Be(500);
    }
} 