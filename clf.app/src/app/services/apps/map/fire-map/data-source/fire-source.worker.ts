// fire-source.worker.ts
// Web Worker for fire data processing

// Types copied inline for worker context (cannot import in worker)
interface FireEvent {
  id?: string;
  source?: string;
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    timestamp: string;
    confidence: number;
    brightness: number;
    intensity: number;
    size?: number;
    containment?: number;
    smokeDirection?: number;
    smokeIntensity?: number;
    [key: string]: any;
  };
}

interface WorkerMessage {
  id: string;
  type: string;
  payload: any;
}

interface WorkerResponse {
  id: string;
  type: string;
  success: boolean;
  data?: any;
  error?: string;
}

interface WorkerResult {
  features: any[]; // Simplified features for worker context
  stats: {
    processed: number;
    filtered: number;
    duration: number;
  };
}

interface ParseAndFilterParams {
  bbox?: [number, number, number, number];
  range?: {
    from: Date;
    to: Date;
  };
}

const WorkerMessageType = {
  INIT: 'init',
  PARSE: 'parse',
  DELTA: 'delta',
  FILTER: 'filter',
  CONVERT_TO_FEATURES: 'convert_to_features',
  PARSE_AND_FILTER: 'parse_and_filter',
  MERGE_FEATURES: 'merge_features',
  DEDUPLICATE: 'deduplicate'
};

function parseFireEvents(rawData: string): FireEvent[] {
  try {
    const parsed = JSON.parse(rawData);
    let events: any[] = [];
    
    if (Array.isArray(parsed)) {
      events = parsed;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      events = parsed.data;
    } else {
      events = [parsed];
    }
    
    return events.map(item => normalizeFireEvent(item)).filter(Boolean) as FireEvent[];
  } catch {
    return [];
  }
}

function normalizeFireEvent(item: any): FireEvent | null {
  try {
    // Handle GeoJSON feature format
    if (item.type === 'Feature') {
      return {
        type: 'Feature',
        id: item.id || item.properties?.id || generateId(),
        geometry: {
          type: 'Point',
          coordinates: item.geometry.coordinates
        },
        properties: {
          timestamp: item.properties.timestamp || new Date().toISOString(),
          confidence: item.properties.confidence || 0,
          brightness: item.properties.brightness || 0,
          intensity: item.properties.intensity || 0,
          ...item.properties
        },
        source: item.source || 'api'
      };
    }

    // Handle plain object format
    return {
      type: 'Feature',
      id: item.id || generateId(),
      geometry: {
        type: 'Point',
        coordinates: item.geometry?.coordinates || [item.longitude, item.latitude]
      },
      properties: {
        timestamp: item.timestamp || new Date().toISOString(),
        confidence: item.confidence || 0,
        brightness: item.brightness || 0,
        intensity: item.intensity || 0,
        ...item
      },
      source: item.source || 'api'
    };
  } catch {
    return null;
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function filterByBounds(events: FireEvent[], bbox: [number, number, number, number]): FireEvent[] {
  if (!bbox) return events;
  const [minX, minY, maxX, maxY] = bbox;
  return events.filter((event: FireEvent) => {
    const [lon, lat] = event.geometry.coordinates;
    return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY;
  });
}

function filterByTime(events: FireEvent[], range: { from: Date; to: Date }): FireEvent[] {
  if (!range) return events;
  const { from, to } = range;
  return events.filter((event: FireEvent) => {
    const eventTime = new Date(event.properties.timestamp);
    return eventTime >= new Date(from) && eventTime <= new Date(to);
  });
}

function convertToFeatures(events: FireEvent[]): any[] {
  // Return a simplified feature array (not OpenLayers features) for worker context
  return events.map((event: FireEvent) => ({
    id: event.id,
    geometry: event.geometry,
    properties: event.properties,
    type: event.type
  }));
}

function mergeFeatures(arrays: FireEvent[][]): FireEvent[] {
  return arrays.flat();
}

function deduplicate(events: FireEvent[]): FireEvent[] {
  const seen = new Set<string>();
  return events.filter((event: FireEvent) => {
    const id = event.id || generateId();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

self.onmessage = function(event: MessageEvent<WorkerMessage>) {
  const { id, type, payload } = event.data;
  const startTime = performance.now();
  
  try {
    switch (type) {
      case WorkerMessageType.INIT:
        self.postMessage({ id, type, success: true, data: { message: 'Worker initialized' } });
        break;
        
      case WorkerMessageType.PARSE: {
        const events = parseFireEvents(payload.rawData || payload.data);
        self.postMessage({ id, type, success: true, data: events });
        break;
      }
      
      case WorkerMessageType.DELTA: {
        let eventObj: FireEvent | null = null;
        try { 
          const parsed = JSON.parse(payload.deltaData);
          eventObj = normalizeFireEvent(parsed.event || parsed);
        } catch {}
        self.postMessage({ id, type, success: true, data: eventObj });
        break;
      }
      
      case WorkerMessageType.FILTER: {
        let events: FireEvent[] = payload.events || [];
        if (payload.bbox) events = filterByBounds(events, payload.bbox);
        if (payload.range) events = filterByTime(events, payload.range);
        self.postMessage({ id, type, success: true, data: events });
        break;
      }
      
      case WorkerMessageType.CONVERT_TO_FEATURES: {
        const events: FireEvent[] = payload.events || [];
        const features = convertToFeatures(events);
        const duration = performance.now() - startTime;
        
        const result: WorkerResult = {
          features,
          stats: {
            processed: features.length,
            filtered: 0,
            duration
          }
        };
        self.postMessage({ id, type, success: true, data: result });
        break;
      }
      
      case WorkerMessageType.PARSE_AND_FILTER: {
        let events = parseFireEvents(payload.data);
        if (payload.params?.bbox) events = filterByBounds(events, payload.params.bbox);
        if (payload.params?.range) events = filterByTime(events, payload.params.range);
        self.postMessage({ id, type, success: true, data: events });
        break;
      }
      
      case WorkerMessageType.MERGE_FEATURES: {
        const merged = mergeFeatures(payload.featureArrays || []);
        self.postMessage({ id, type, success: true, data: merged });
        break;
      }
      
      case WorkerMessageType.DEDUPLICATE: {
        const deduped = deduplicate(payload.events || []);
        self.postMessage({ id, type, success: true, data: deduped });
        break;
      }
      
      default:
        self.postMessage({ id, type, success: false, error: 'Unknown message type' });
    }
  } catch (err) {
    let errorMsg = 'Worker error';
    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      errorMsg = err.message;
    }
    self.postMessage({ id, type, success: false, error: errorMsg });
  }
};
