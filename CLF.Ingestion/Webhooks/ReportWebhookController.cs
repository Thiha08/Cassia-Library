using Microsoft.AspNetCore.Mvc;
using Orleans;
using CLF.Ingestion.Grains.Interfaces;

namespace CLF.Ingestion.Webhooks;

[ApiController]
[Route("api/webhooks/report")]
public class ReportWebhookController : ControllerBase
{
    private readonly IGrainFactory _grainFactory;
    public ReportWebhookController(IGrainFactory grainFactory) => _grainFactory = grainFactory;

    [HttpPost]
    public async Task<IActionResult> Receive([FromBody] object payload)
    {
        var grain = _grainFactory.GetGrain<IIngestionGrain>("CASSIA_USER_REPORT");
        await grain.ProcessWebhookAsync(payload.ToString() ?? "");
        return Ok();
    }
} 