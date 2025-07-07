using Orleans;
using CLF.Ingestion.Grains.Interfaces;

namespace CLF.Ingestion.Grains.Interfaces;

/// <summary>
/// NASA FIRMS specific ingestion grain interface
/// </summary>
public interface INasaFirmsIngestionGrain : IIngestionGrain
{
}

/// <summary>
/// USGS specific ingestion grain interface
/// </summary>
public interface IUSGSIngestionGrain : IIngestionGrain
{
}

/// <summary>
/// GDACS specific ingestion grain interface
/// </summary>
public interface IGDACSIngestionGrain : IIngestionGrain
{
}

/// <summary>
/// Twitter specific ingestion grain interface
/// </summary>
public interface ITwitterIngestionGrain : IIngestionGrain
{
}

/// <summary>
/// Cassia User Report specific ingestion grain interface
/// </summary>
public interface ICassiaUserReportIngestionGrain : IIngestionGrain
{
} 