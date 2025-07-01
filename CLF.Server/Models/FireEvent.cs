using System.Text.Json.Serialization;

namespace CLF.Server.Models;

public class FireEvent
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "Feature";
    public string Township { get; set; } = string.Empty;
    public Geometry Geometry { get; set; } = new();
    public FireEventProperties Properties { get; set; } = new();
    public string Source { get; set; } = "API";
}

public class Geometry
{
    public string Type { get; set; } = "Point";
    public double[] Coordinates { get; set; } = new double[2]; // [longitude, latitude]
}

public class FireEventProperties
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public double Intensity { get; set; }
    public string Status { get; set; } = "active";
    public double? Temperature { get; set; }
    public double? Humidity { get; set; }
    public double? WindSpeed { get; set; }
    public string? WindDirection { get; set; }
    public string? WeatherCondition { get; set; }
    public string? FireType { get; set; }
    public double? AreaAffected { get; set; }
    public string? Severity { get; set; }
    public string? Source { get; set; }
    public string? Confidence { get; set; }
    public string? Satellite { get; set; }
    public string? Algorithm { get; set; }
    public double? Brightness { get; set; }
    public double? Frp { get; set; }
    public string? DayNight { get; set; }
    public string? Type { get; set; }
    public string? Country { get; set; }
    public string? State { get; set; }
    public string? County { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? ZipCode { get; set; }
    public string? TimeZone { get; set; }
    public string? Elevation { get; set; }
    public string? LandCover { get; set; }
    public string? Population { get; set; }
    public string? Infrastructure { get; set; }
    public string? EmergencyContacts { get; set; }
    public string? EvacuationRoutes { get; set; }
    public string? WaterSources { get; set; }
    public string? AccessPoints { get; set; }
    public string? Terrain { get; set; }
    public string? Vegetation { get; set; }
    public string? RiskLevel { get; set; }
    public string? ResponseTime { get; set; }
    public string? Resources { get; set; }
    public string? Notes { get; set; }
}

public class TownshipFireSummary
{
    public string Township { get; set; } = string.Empty;
    public int EventCount { get; set; }
    public DateTime LastEventTime { get; set; }
    public double AverageIntensity { get; set; }
    public string MostSevereStatus { get; set; } = string.Empty;
}

public class FireEventQuery
{
    public string[]? Townships { get; set; }
    public double[]? Bbox { get; set; } // [minLon, minLat, maxLon, maxLat]
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Status { get; set; }
    public double? MinIntensity { get; set; }
    public double? MaxIntensity { get; set; }
}

public class FireEventResponse
{
    public List<FireEvent> Events { get; set; } = new();
    public int TotalCount { get; set; }
    public DateTime QueryTime { get; set; } = DateTime.UtcNow;
    public string QueryId { get; set; } = Guid.NewGuid().ToString();
} 