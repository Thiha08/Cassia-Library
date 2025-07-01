using CLF.Shared.Interfaces;
using CLF.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using CLF.Ingestion.Adapters;
using CLF.Ingestion.Grains;
using CLF.Ingestion.Grains.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Orleans;
using Orleans.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CLF Ingestion API", Version = "v1" });
    c.EnableAnnotations();
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
});

builder.Services.AddHttpClient("StorageService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:Storage"] ?? "https://localhost:5003");
});

// Register adapters
builder.Services.AddHttpClient<NasaFirmsAdapter>();
builder.Services.AddHttpClient<USGSAdapter>();
builder.Services.AddHttpClient<GDACSAdapter>();
builder.Services.AddHttpClient<TwitterAdapter>();
builder.Services.AddSingleton<CassiaUserReportAdapter>();

// Register grains
builder.Services.AddSingleton<NasaFirmsIngestionGrain>();
builder.Services.AddSingleton<USGSIngestionGrain>();
builder.Services.AddSingleton<GDACSIngestionGrain>();
builder.Services.AddSingleton<TwitterIngestionGrain>();
builder.Services.AddSingleton<CassiaUserReportIngestionGrain>();
builder.Services.AddSingleton<ETLGrain>();
builder.Services.AddSingleton<EventStoreGrain>();
builder.Services.AddSingleton<IngestionScheduler>();

// Configure logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
});

// Orleans setup
builder.Host.UseOrleans(siloBuilder =>
{
    siloBuilder
        .UseLocalhostClustering()
        .AddMemoryGrainStorage("Default")
        .AddSimpleMessageStreamProvider("IngestionStreamProvider");
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
    });
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { Status = "Healthy", Service = "Ingestion", Timestamp = DateTime.UtcNow });

app.Run();
