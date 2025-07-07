using CLF.Shared.Interfaces;
using CLF.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using CLF.Ingestion.Adapters;
using CLF.Ingestion.Grains;
using CLF.Ingestion.Grains.Interfaces;
using CLF.Ingestion.Schedulers;
using CLF.Ingestion.Factories;
using Microsoft.Extensions.DependencyInjection;
using Orleans;
using Orleans.Hosting;
using Orleans.Streams;
using Orleans.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CLF Ingestion API", Version = "v1" });
});

// Configure SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 102400; // 100KB
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure Entity Framework
builder.Services.AddDbContext<CLFDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (builder.Environment.IsDevelopment() && string.IsNullOrEmpty(connectionString))
    {
        options.UseInMemoryDatabase("CLF_Ingestion_DB");
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});

// Configure HTTP clients for downstream services
builder.Services.AddHttpClient("ETLService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:ETL"] ?? "https://localhost:5002");
    client.Timeout = TimeSpan.FromMinutes(5);
});

builder.Services.AddHttpClient("StorageService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:Storage"] ?? "https://localhost:5003");
    client.Timeout = TimeSpan.FromMinutes(5);
});

// Register adapters with HTTP client factory
builder.Services.AddHttpClient<NasaFirmsAdapter>();
builder.Services.AddHttpClient<USGSAdapter>();
builder.Services.AddHttpClient<GDACSAdapter>();
builder.Services.AddHttpClient<TwitterAdapter>();
builder.Services.AddSingleton<CassiaUserReportAdapter>();

// Register factories and services
builder.Services.AddSingleton<IDataSourceFactory, DataSourceFactory>();
builder.Services.AddSingleton<DataSourceRegistry>();

// Register schedulers
builder.Services.AddSingleton<IngestionScheduler>();
builder.Services.AddSingleton<EnhancedIngestionScheduler>();

// Configure logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
    logging.SetMinimumLevel(LogLevel.Information);
});

// Orleans setup
builder.Host.UseOrleans(siloBuilder =>
{
    siloBuilder
        .UseLocalhostClustering()
        .AddMemoryGrainStorage("Default")
        .AddMemoryGrainStorage("PubSubStore")
        .AddMemoryStreams("IngestionStreamProvider");

    // Configure serialization for CLF.Shared.Models
    siloBuilder.Services.AddSerializer(serializerBuilder =>
    {
        serializerBuilder.AddJsonSerializer(
            isSupported: type => type.Namespace?.StartsWith("CLF.Shared.Models") == true);
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CLF Ingestion API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at root
        c.DocumentTitle = "CLF Ingestion API Documentation";
    });
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { 
    Status = "Healthy", 
    Service = "Ingestion", 
    Timestamp = DateTime.UtcNow,
    Version = "1.0.0"
});



app.Run();
