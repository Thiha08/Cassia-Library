using CLF.Ingestion.Factories;
using CLF.Ingestion.Adapters;
using CLF.Infrastructure.Data;
using CLF.Shared.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Orleans.Serialization;
using Orleans.TestingHost;
using Testcontainers.MsSql;

namespace CLF.Ingestion.Tests;

/// <summary>
/// Base class for Orleans-based tests with test host setup
/// </summary>
public abstract class TestBase : IDisposable
{
    protected TestCluster? Cluster { get; private set; }
    protected IClusterClient? Client { get; private set; }
    protected IServiceProvider? ServiceProvider { get; private set; }
    protected CLFDbContext? DbContext { get; private set; }
    protected MsSqlContainer? SqlContainer { get; private set; }
    protected IConfiguration? Configuration { get; private set; }

    protected virtual void SetupTestCluster()
    {
        // Load test configuration
        Configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.test.json", optional: false)
            .AddEnvironmentVariables()
            .Build();

        var builder = new TestClusterBuilder();
        
        // Configure silo
        builder.AddSiloBuilderConfigurator<TestSiloConfigurator>();
        
        // Configure client
        builder.AddClientBuilderConfigurator<TestClientConfigurator>();
        
        Cluster = builder.Build();
        Cluster.Deploy();
        
        Client = Cluster.Client;
        ServiceProvider = Client.ServiceProvider;

        // Setup database context
        SetupDatabaseContext();
    }

    protected virtual async Task SetupTestClusterAsync()
    {
        // Start SQL Server container for integration tests
        if (Configuration?.GetValue<bool>("Testing:UseInMemoryDatabase") == false)
        {
            SqlContainer = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .WithPassword("TestPassword123!")
                .WithName("clf-ingestion-test-db")
                .Build();

            await SqlContainer.StartAsync();
            
            // Update connection string to use container
            var connectionString = SqlContainer.GetConnectionString();
            Configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.test.json", optional: false)
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["ConnectionStrings:DefaultConnection"] = connectionString
                })
                .AddEnvironmentVariables()
                .Build();
        }

        SetupTestCluster();
    }

    protected virtual void SetupDatabaseContext()
    {
        var optionsBuilder = new DbContextOptionsBuilder<CLFDbContext>();
        
        if (Configuration?.GetValue<bool>("Testing:UseInMemoryDatabase") == true)
        {
            optionsBuilder.UseInMemoryDatabase($"CLF_Ingestion_Test_{Guid.NewGuid()}");
        }
        else
        {
            var connectionString = Configuration?.GetConnectionString("DefaultConnection");
            optionsBuilder.UseSqlServer(connectionString);
        }

        DbContext = new CLFDbContext(optionsBuilder.Options);
        DbContext.Database.EnsureCreated();
    }

    protected virtual void CleanupTestCluster()
    {
        DbContext?.Dispose();
        Cluster?.StopAllSilos();
        Cluster?.Dispose();
        Cluster = null;
        Client = null;
        ServiceProvider = null;
        DbContext = null;
    }

    protected virtual async Task CleanupTestClusterAsync()
    {
        CleanupTestCluster();
        
        if (SqlContainer != null)
        {
            await SqlContainer.DisposeAsync();
            SqlContainer = null;
        }
    }

    protected IDataSourceFactory GetDataSourceFactory()
    {
        return ServiceProvider!.GetRequiredService<IDataSourceFactory>();
    }

    protected ILogger<T> GetLogger<T>()
    {
        return ServiceProvider!.GetRequiredService<ILogger<T>>();
    }

    protected IClusterClient GetClient()
    {
        return Client!;
    }

    protected CLFDbContext GetDbContext()
    {
        return DbContext!;
    }

    protected IConfiguration GetConfiguration()
    {
        return Configuration!;
    }

    protected async Task<ExternalDataSource> CreateTestDataSourceAsync(string name = "Test Source", string type = "nasa-firms")
    {
        var source = new ExternalDataSource
        {
            Id = Guid.NewGuid(),
            Name = name,
            Type = type,
            PollingInterval = TimeSpan.FromMinutes(1),
            Configuration = new Dictionary<string, string>
            {
                ["ApiKey"] = "test-key",
                ["Area"] = "global"
            },
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "TestUser"
        };

        DbContext!.ExternalDataSources.Add(source);
        await DbContext.SaveChangesAsync();
        return source;
    }

    protected async Task<RawData> CreateTestRawDataAsync(Guid sourceId, string dataType = "test-data")
    {
        var rawData = new RawData
        {
            Id = Guid.NewGuid(),
            SourceId = sourceId,
            DataType = dataType,
            RawContent = "{\"test\": \"data\"}",
            Metadata = new Dictionary<string, object>
            {
                ["TestKey"] = "TestValue"
            },
            Status = DataIngestionStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "TestUser"
        };

        DbContext!.RawData.Add(rawData);
        await DbContext.SaveChangesAsync();
        return rawData;
    }

    public virtual void Dispose()
    {
        CleanupTestCluster();
        GC.SuppressFinalize(this);
    }

    public virtual async ValueTask DisposeAsync()
    {
        await CleanupTestClusterAsync();
        GC.SuppressFinalize(this);
    }
}

/// <summary>
/// Test silo configuration
/// </summary>
public class TestSiloConfigurator : ISiloConfigurator
{
    public void Configure(ISiloBuilder siloBuilder)
    {
        siloBuilder
            .ConfigureServices(services =>
            {
                // Add HTTP client factory
                services.AddHttpClient();
                
                // Add logging
                services.AddLogging(builder =>
                {
                    builder.AddConsole();
                    builder.SetMinimumLevel(LogLevel.Debug);
                });
                
                // Add data source factory
                services.AddSingleton<IDataSourceFactory, DataSourceFactory>();
                
                // Add adapters
                services.AddHttpClient<NasaFirmsAdapter>();
                services.AddHttpClient<USGSAdapter>();
                services.AddHttpClient<GDACSAdapter>();
                services.AddHttpClient<TwitterAdapter>();
                services.AddSingleton<CassiaUserReportAdapter>();
                
                // Configure Orleans serialization for CLF.Shared.Models
                services.AddSerializer(serializerBuilder =>
                {
                    serializerBuilder.AddJsonSerializer(
                        isSupported: type => type.Namespace?.StartsWith("CLF.Shared.Models") == true);
                });
            })
            .AddMemoryGrainStorage("Default")
            .AddMemoryGrainStorage("PubSubStore")
            .AddMemoryStreams("IngestionStreamProvider");
    }
}

/// <summary>
/// Test client configuration
/// </summary>
public class TestClientConfigurator : IClientBuilderConfigurator
{
    public void Configure(IConfiguration configuration, IClientBuilder clientBuilder)
    {
        clientBuilder
            .AddMemoryStreams("IngestionStreamProvider");
    }
}

 