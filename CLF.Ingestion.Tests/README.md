# CLF.Ingestion.Tests

Comprehensive test suite for the CLF Ingestion service, covering unit tests, integration tests, and performance tests.

## Test Structure

### Test Categories

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test component interactions and Orleans grains
3. **Controller Tests** - Test API endpoints and controllers
4. **Performance Tests** - Test system performance and scalability
5. **Adapter Tests** - Test data source adapters

### Test Infrastructure

- **TestBase** - Base class providing Orleans test cluster setup
- **Test Configuration** - Dedicated test configuration in `appsettings.test.json`
- **Test Data** - Sample data files in `TestData/` directory
- **Database Support** - In-memory and SQL Server container support

## Running Tests

### Prerequisites

- .NET 8.0 SDK
- Docker (for SQL Server container tests)
- Visual Studio 2022 or VS Code

### Basic Test Execution

```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test category
dotnet test --filter "Category=Integration"

# Run tests in parallel
dotnet test --maxcpucount:4
```

### Test Categories

```bash
# Unit tests only
dotnet test --filter "Category=Unit"

# Integration tests only
dotnet test --filter "Category=Integration"

# Performance tests only
dotnet test --filter "Category=Performance"

# Controller tests only
dotnet test --filter "Category=Controller"
```

### Coverage Reports

```bash
# Generate coverage report
dotnet test --collect:"XPlat Code Coverage" --results-directory TestResults

# View coverage in browser (requires reportgenerator)
reportgenerator -reports:TestResults/**/coverage.opencover.xml -targetdir:TestResults/CoverageReport
```

## Test Configuration

### appsettings.test.json

```json
{
  "Logging": {
    "LogLevel": {
      "CLF.Ingestion.Tests": "Debug"
    }
  },
  "Testing": {
    "UseInMemoryDatabase": true,
    "MockExternalServices": true,
    "TestTimeout": "00:05:00"
  }
}
```

### Test Data

Sample data files are located in `TestData/`:

- `nasa-firms-sample.json` - NASA FIRMS fire detection data
- `usgs-earthquake-sample.json` - USGS earthquake data
- Additional sample files for other data sources

## Test Classes

### TestBase

Base class providing:
- Orleans test cluster setup
- Database context configuration
- Test data creation helpers
- Cleanup utilities

```csharp
public class MyTest : TestBase
{
    [Fact]
    public async Task MyTest_ShouldWork()
    {
        // Arrange
        SetupTestCluster();
        var testSource = await CreateTestDataSourceAsync();
        
        // Act & Assert
        // Your test logic here
    }
}
```

### IntegrationTests

Tests Orleans grain interactions:
- Grain initialization and lifecycle
- Data source registration
- Polling and webhook processing
- Stream processing

### ControllerTests

Tests API endpoints:
- Data source management
- Ingestion record operations
- Health checks
- Error handling

### PerformanceTests

Tests system performance:
- Concurrent grain operations
- High-volume stream processing
- Database bulk operations
- Memory usage monitoring

### Adapter Tests

Tests data source adapters:
- NASA FIRMS adapter
- USGS adapter
- GDACS adapter
- Twitter adapter

## Test Utilities

### Test Data Creation

```csharp
// Create test data source
var source = await CreateTestDataSourceAsync("Test Source", "nasa-firms");

// Create test raw data
var rawData = await CreateTestRawDataAsync(source.Id, "test-data");
```

### Orleans Grain Testing

```csharp
// Get Orleans client
var client = GetClient();

// Get grain instance
var grain = client.GetGrain<INasaFirmsIngestionGrain>("test-grain");

// Test grain operations
await grain.InitializeAsync(source);
var result = await grain.TriggerFetchAsync();
```

### Database Testing

```csharp
// Get database context
var dbContext = GetDbContext();

// Query data
var sources = await dbContext.ExternalDataSources.ToListAsync();
var rawData = await dbContext.RawData.FindAsync(id);
```

## Test Patterns

### Arrange-Act-Assert

```csharp
[Fact]
public async Task Test_ShouldWork()
{
    // Arrange
    SetupTestCluster();
    var grain = GetClient().GetGrain<INasaFirmsIngestionGrain>("test");
    var source = await CreateTestDataSourceAsync();
    
    // Act
    await grain.InitializeAsync(source);
    var result = await grain.TriggerFetchAsync();
    
    // Assert
    result.Should().NotBeNull();
    result.Success.Should().BeTrue();
}
```

### Async Testing

```csharp
[Fact]
public async Task AsyncTest_ShouldComplete()
{
    // Arrange
    SetupTestCluster();
    
    // Act
    var tasks = Enumerable.Range(0, 10)
        .Select(i => GetClient().GetGrain<INasaFirmsIngestionGrain>($"grain-{i}"))
        .Select(g => g.TriggerFetchAsync());
    
    var results = await Task.WhenAll(tasks);
    
    // Assert
    results.Should().HaveCount(10);
    results.Should().OnlyContain(r => r.Success);
}
```

### Mock Testing

```csharp
[Fact]
public async Task MockTest_ShouldWork()
{
    // Arrange
    var mockClient = new Mock<IClusterClient>();
    var mockLogger = new Mock<ILogger<IngestionController>>();
    
    // Act
    var controller = new IngestionController(
        GetDbContext(),
        mockLogger.Object,
        ServiceProvider!.GetRequiredService<IHttpClientFactory>(),
        mockClient.Object,
        null!);
    
    // Assert
    // Your assertions here
}
```

## Performance Testing

### Concurrent Operations

```csharp
[Fact]
public async Task MultipleGrains_ShouldHandleConcurrentOperations()
{
    // Test concurrent grain operations
    var tasks = grains.Select(g => g.TriggerFetchAsync());
    var results = await Task.WhenAll(tasks);
    
    results.Should().HaveCount(expectedCount);
    results.Should().OnlyContain(r => r.Success);
}
```

### Stream Processing

```csharp
[Fact]
public async Task StreamProcessing_ShouldHandleHighVolumeData()
{
    // Test high-volume stream processing
    var receivedData = new List<RawData>();
    var subscription = await stream.SubscribeAsync(new TestStreamObserver(receivedData));
    
    // Publish data
    await Task.WhenAll(dataItems.Select(d => stream.OnNextAsync(d)));
    
    receivedData.Should().HaveCount(expectedCount);
}
```

## Continuous Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: |
    dotnet test --collect:"XPlat Code Coverage" --results-directory TestResults
    dotnet tool install -g dotnet-reportgenerator-globaltool
    reportgenerator -reports:TestResults/**/coverage.opencover.xml -targetdir:TestResults/CoverageReport
```

### Azure DevOps

```yaml
- task: DotNetCoreCLI@2
  inputs:
    command: 'test'
    projects: '**/*Tests/*.csproj'
    arguments: '--collect:"XPlat Code Coverage" --results-directory TestResults'
```

## Troubleshooting

### Common Issues

1. **Orleans Connection Issues**
   - Check test cluster configuration
   - Verify silo ports are available
   - Review Orleans logs

2. **Database Connection Issues**
   - Ensure in-memory database is configured
   - Check SQL Server container is running
   - Verify connection strings

3. **Test Timeouts**
   - Increase test timeout in configuration
   - Check for long-running operations
   - Review async/await patterns

### Debugging

1. **Enable Debug Logging**
   ```json
   {
     "Logging": {
       "LogLevel": {
         "CLF.Ingestion.Tests": "Debug"
       }
     }
   }
   ```

2. **Run Single Test**
   ```bash
   dotnet test --filter "FullyQualifiedName~TestName"
   ```

3. **Attach Debugger**
   ```bash
   dotnet test --logger "console;verbosity=detailed"
   ```

## Best Practices

1. **Test Isolation** - Each test should be independent
2. **Async/Await** - Use proper async patterns
3. **Cleanup** - Always clean up test resources
4. **Assertions** - Use FluentAssertions for readable assertions
5. **Performance** - Monitor test execution time
6. **Coverage** - Maintain high test coverage

## Contributing

1. Write tests for new features
2. Ensure all tests pass
3. Maintain test coverage above 80%
4. Follow naming conventions
5. Add appropriate test categories
6. Update documentation 