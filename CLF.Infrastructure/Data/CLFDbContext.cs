using Microsoft.EntityFrameworkCore;
using CLF.Shared.Models;

namespace CLF.Infrastructure.Data;

public class CLFDbContext : DbContext
{
    public CLFDbContext(DbContextOptions<CLFDbContext> options) : base(options)
    {
    }

    // External Data Sources
    public DbSet<ExternalDataSource> ExternalDataSources { get; set; }

    // Raw Data (Staging)
    public DbSet<RawData> RawData { get; set; }

    // Clean Data (Processed)
    public DbSet<CleanData> CleanData { get; set; }

    // Event Store
    public DbSet<EventData> EventData { get; set; }

    // Time Series Data
    public DbSet<TimeSeriesData> TimeSeriesData { get; set; }

    // Geo Data
    public DbSet<GeoData> GeoData { get; set; }

    // Pipeline Configuration
    public DbSet<PipelineConfiguration> PipelineConfigurations { get; set; }

    // Pipeline Execution Results
    public DbSet<PipelineExecutionResult> PipelineExecutionResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure base entity
        modelBuilder.Entity<BaseEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
        });

        // Configure ExternalDataSource
        modelBuilder.Entity<ExternalDataSource>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ConnectionString).IsRequired();
            entity.Property(e => e.Configuration).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, string>()
            );
        });

        // Configure RawData
        modelBuilder.Entity<RawData>(entity =>
        {
            entity.Property(e => e.DataType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.RawContent).IsRequired();
            entity.Property(e => e.Metadata).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
        });

        // Configure CleanData
        modelBuilder.Entity<CleanData>(entity =>
        {
            entity.Property(e => e.DataType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ProcessedData).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            entity.Property(e => e.ValidationResults).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
        });

        // Configure EventData
        modelBuilder.Entity<EventData>(entity =>
        {
            entity.Property(e => e.EventType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AggregateId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Version).IsRequired();
            entity.Property(e => e.EventData).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.Property(e => e.Metadata).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );

            // Index for efficient event retrieval
            entity.HasIndex(e => new { e.AggregateId, e.Version });
        });

        // Configure TimeSeriesData
        modelBuilder.Entity<TimeSeriesData>(entity =>
        {
            entity.Property(e => e.MetricName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Timestamp).IsRequired();
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Tags).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, string>()
            );
            entity.Property(e => e.Source).HasMaxLength(100);

            // Index for efficient time series queries
            entity.HasIndex(e => new { e.MetricName, e.Timestamp });
            entity.HasIndex(e => e.Timestamp);
        });

        // Configure GeoData
        modelBuilder.Entity<GeoData>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Latitude).IsRequired();
            entity.Property(e => e.Longitude).IsRequired();
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Properties).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.Property(e => e.GeoJson).HasMaxLength(4000);
            entity.Property(e => e.GeometryType).HasMaxLength(50);

            // Index for geospatial queries
            entity.HasIndex(e => new { e.Latitude, e.Longitude });
        });

        // Configure PipelineConfiguration
        modelBuilder.Entity<PipelineConfiguration>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Steps).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );
            entity.Property(e => e.Settings).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
        });

        // Configure PipelineExecutionResult
        modelBuilder.Entity<PipelineExecutionResult>(entity =>
        {
            entity.Property(e => e.ExecutionId).IsRequired();
            entity.Property(e => e.PipelineName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.StartedAt).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.Steps).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );
            entity.Property(e => e.Results).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);

            // Index for pipeline execution queries
            entity.HasIndex(e => new { e.PipelineName, e.StartedAt });
            entity.HasIndex(e => e.ExecutionId);
        });
    }
} 