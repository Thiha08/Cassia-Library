using CLF.Shared.Interfaces;
using CLF.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CLF Gateway API", Version = "v1" });
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

// Configure HTTP clients for microservices
builder.Services.AddHttpClient("IngestionService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:Ingestion"] ?? "https://localhost:5001");
});

builder.Services.AddHttpClient("ETLService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:ETL"] ?? "https://localhost:5002");
});

builder.Services.AddHttpClient("StorageService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:Storage"] ?? "https://localhost:5003");
});

builder.Services.AddHttpClient("OrleansService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:Orleans"] ?? "https://localhost:5004");
});

// Configure Entity Framework
builder.Services.AddDbContext<CLFDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (builder.Environment.IsDevelopment() && string.IsNullOrEmpty(connectionString))
    {
        options.UseInMemoryDatabase("CLF_Gateway_DB");
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});

// Configure logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CLF Gateway API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at root
    });
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow });

// API Gateway routing
app.MapGet("/api/status", async (IHttpClientFactory httpClientFactory) =>
{
    var services = new Dictionary<string, string>
    {
        { "Ingestion", "https://localhost:5001/health" },
        { "ETL", "https://localhost:5002/health" },
        { "Storage", "https://localhost:5003/health" },
        { "Orleans", "https://localhost:5004/health" }
    };

    var status = new Dictionary<string, object>();
    var httpClient = httpClientFactory.CreateClient();

    foreach (var service in services)
    {
        try
        {
            var response = await httpClient.GetAsync(service.Value);
            status[service.Key] = new { Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy", StatusCode = (int)response.StatusCode };
        }
        catch (Exception ex)
        {
            status[service.Key] = new { Status = "Unreachable", Error = ex.Message };
        }
    }

    return Results.Ok(new { Services = status, Timestamp = DateTime.UtcNow });
});

app.Run();
