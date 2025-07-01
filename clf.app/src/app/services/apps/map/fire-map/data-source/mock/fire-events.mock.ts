import { FireEvent } from "../../models";
import { DataSourceType } from "../../models";

/**
 * Mock fire event data for testing and development
 * Contains various types of fire events with different properties
 * and timestamps to simulate real-world scenarios
 */

// Myanmar extent coordinates (longitude, latitude)
const MYANMAR_EXTENT: [number, number, number, number] = [
  88.0,  // minLon (western boundary)
  3.0,   // minLat (southern boundary)
  108.0, // maxLon (eastern boundary)
  36.0   // maxLat (northern boundary)
];

// Major cities in Myanmar with their approximate coordinates
const MYANMAR_CITIES: Record<string, { coordinates: [number, number], township: string }> = {
  YANGON: { coordinates: [96.1951, 16.8661], township: 'Yangon' },
  MANDALAY: { coordinates: [96.0844, 21.9756], township: 'Mandalay' },
  NAYPYIDAW: { coordinates: [96.0785, 19.7633], township: 'Naypyidaw' },
  MAWLAMYINE: { coordinates: [97.6283, 16.4905], township: 'Mawlamyine' },
  BAGO: { coordinates: [96.4797, 17.3367], township: 'Bago' },
  TAUNGGYI: { coordinates: [97.0378, 20.7892], township: 'Taunggyi' },
  MEIKTILA: { coordinates: [95.8581, 20.8733], township: 'Meiktila' },
  PATHEIN: { coordinates: [94.7294, 16.7735], township: 'Pathein' },
  MYITKYINA: { coordinates: [97.3956, 25.3833], township: 'Myitkyina' },
  SITTWE: { coordinates: [92.9000, 20.1500], township: 'Sittwe' }
};

// Generate random coordinates within Myanmar extent
function generateRandomCoordinatesInMyanmar(): [number, number] {
  const [minLon, minLat, maxLon, maxLat] = MYANMAR_EXTENT;
  
  const lon = minLon + Math.random() * (maxLon - minLon);
  const lat = minLat + Math.random() * (maxLat - minLat);
  
  return [lon, lat];
}

// Generate random coordinates within a radius of a base point
function generateRandomCoordinatesAroundPoint(base: [number, number], radius: number = 0.5): [number, number] {
  const [lon, lat] = base;
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * radius;
  
  return [
    lon + randomRadius * Math.cos(randomAngle),
    lat + randomRadius * Math.sin(randomAngle)
  ];
}

// Get a random township name
function getRandomTownship(): string {
  const townships = Object.values(MYANMAR_CITIES).map(city => city.township);
  return townships[Math.floor(Math.random() * townships.length)];
}

// Generate a random fire event
function generateFireEvent(
  id: string,
  coordinates: [number, number],
  timestamp: Date,
  source: DataSourceType,
  township?: string
): FireEvent {
  const confidence = Math.floor(Math.random() * 100);
  const brightness = Math.floor(Math.random() * 100);
  const temperature = Math.floor(Math.random() * 500) + 200; // 200-700°C
  const intensity = Math.floor(Math.random() * 100); // 0-100 intensity

  return {
    id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    },
    township: township || getRandomTownship(),
    properties: {
      timestamp: timestamp.toISOString(),
      confidence,
      brightness,
      temperature,
      intensity,
      size: Math.floor(Math.random() * 1000) + 100, // 100-1100 m²
      status: Math.random() > 0.8 ? 'resolved' : 'active',
      source: source,
      metadata: {
        detectedBy: Math.random() > 0.5 ? 'satellite' : 'ground_sensor',
        lastUpdated: new Date(timestamp.getTime() + Math.random() * 3600000).toISOString()
      }
    },
    source
  };
}

// Generate a batch of fire events within Myanmar
function generateFireEventsInMyanmar(
  count: number,
  startTime: Date,
  endTime: Date,
  source: DataSourceType,
  distribution: 'random' | 'around_cities' | 'mixed' = 'mixed'
): FireEvent[] {
  const events: FireEvent[] = [];
  const timeRange = endTime.getTime() - startTime.getTime();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTime.getTime() + Math.random() * timeRange);
    
    let coordinates: [number, number];
    let township: string | undefined;

    // Determine distribution strategy
    if (distribution === 'random' || (distribution === 'mixed' && Math.random() > 0.7)) {
      // Random distribution across Myanmar
      coordinates = generateRandomCoordinatesInMyanmar();
    } else {
      // Around major cities
      const cityKeys = Object.keys(MYANMAR_CITIES);
      const randomCity = cityKeys[Math.floor(Math.random() * cityKeys.length)];
      const city = MYANMAR_CITIES[randomCity];
      coordinates = generateRandomCoordinatesAroundPoint(city.coordinates, 1.0);
      township = city.township;
    }

    events.push(generateFireEvent(
      `fire-${source}-${i}`,
      coordinates,
      timestamp,
      source,
      township
    ));
  }

  return events;
}

// Generate mock data for different regions within Myanmar
export const MOCK_FIRE_EVENTS: { [key: string]: FireEvent[] } = {
  MYANMAR: generateFireEventsInMyanmar(
    100, // More events for the full country
    new Date(Date.now() - 24 * 3600000), // Last 24 hours
    new Date(),
    DataSourceType.API,
    'mixed'
  ),
  YANGON: generateFireEventsInMyanmar(
    30,
    new Date(Date.now() - 24 * 3600000),
    new Date(),
    DataSourceType.API,
    'around_cities'
  ).filter(event => event.township === 'Yangon'),
  MANDALAY: generateFireEventsInMyanmar(
    40,
    new Date(Date.now() - 24 * 3600000),
    new Date(),
    DataSourceType.API,
    'around_cities'
  ).filter(event => event.township === 'Mandalay'),
  NAYPYIDAW: generateFireEventsInMyanmar(
    25,
    new Date(Date.now() - 24 * 3600000),
    new Date(),
    DataSourceType.API,
    'around_cities'
  ).filter(event => event.township === 'Naypyidaw'),
  BAGO: generateFireEventsInMyanmar(
    35,
    new Date(Date.now() - 24 * 3600000),
    new Date(),
    DataSourceType.API,
    'around_cities'
  ).filter(event => event.township === 'Bago')
};

// Generate realtime mock data
export const MOCK_REALTIME_EVENTS: FireEvent[] = generateFireEventsInMyanmar(
  20,
  new Date(Date.now() - 3600000), // Last hour
  new Date(),
  DataSourceType.REALTIME,
  'mixed'
);

// Generate local network mock data
export const MOCK_LOCAL_EVENTS: FireEvent[] = generateFireEventsInMyanmar(
  15,
  new Date(Date.now() - 7200000), // Last 2 hours
  new Date(),
  DataSourceType.LOCAL_NETWORK,
  'around_cities'
);

// Helper function to filter events by bounding box
export function filterEventsByBbox(events: FireEvent[], bbox: [number, number, number, number]): FireEvent[] {
  const [minX, minY, maxX, maxY] = bbox;
  return events.filter(event => {
    const [lon, lat] = event.geometry.coordinates;
    return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY;
  });
}

// Helper function to filter events by time range
export function filterEventsByTimeRange(
  events: FireEvent[],
  from: Date,
  to: Date
): FireEvent[] {
  return events.filter(event => {
    const eventTime = new Date(event.properties.timestamp);
    return eventTime >= from && eventTime <= to;
  });
}

// Helper function to get all mock events
export function getAllMockEvents(): FireEvent[] {
  return Object.values(MOCK_FIRE_EVENTS).flat();
}

// Helper function to get events by source type
export function getEventsBySource(source: DataSourceType): FireEvent[] {
  switch (source) {
    case DataSourceType.REALTIME:
      return MOCK_REALTIME_EVENTS;
    case DataSourceType.LOCAL_NETWORK:
      return MOCK_LOCAL_EVENTS;
    case DataSourceType.API:
      return getAllMockEvents();
    default:
      return [];
  }
}

// Helper function to get Myanmar extent
export function getMyanmarExtent(): [number, number, number, number] {
  return MYANMAR_EXTENT;
}

// Helper function to get events by township
export function getEventsByTownship(township: string): FireEvent[] {
  return getAllMockEvents().filter(event => event.township === township);
}

// Helper function to generate events for a specific region
export function generateEventsForRegion(
  region: string,
  count: number,
  startTime: Date,
  endTime: Date,
  source: DataSourceType
): FireEvent[] {
  if (MYANMAR_CITIES[region.toUpperCase()]) {
    const city = MYANMAR_CITIES[region.toUpperCase()];
    return generateFireEventsInMyanmar(count, startTime, endTime, source, 'around_cities')
      .filter(event => event.township === city.township);
  }
  
  // If region not found, generate random events in Myanmar
  return generateFireEventsInMyanmar(count, startTime, endTime, source, 'random');
} 