using Orleans;
using Orleans.Hosting;
using CLF.Server.Grains;
using CLF.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 102400; // 100KB
});

// Configure Orleans
builder.Services.AddOrleans(siloBuilder =>
{
    siloBuilder
        .UseLocalhostClustering()
        .AddMemoryGrainStorage("fire-store")
        .ConfigureLogging(logging => logging.AddConsole());
});

// Configure CORS for SignalR
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

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

// Map SignalR hub
app.MapHub<FireHub>("/hubs/fire");

app.MapFallbackToFile("/index.html");

app.Run();
