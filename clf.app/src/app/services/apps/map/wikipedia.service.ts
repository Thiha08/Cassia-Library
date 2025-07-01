import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';

/**
 * Common interface for all data services
 * Provides standardized methods for loading and filtering layer data
 */
export interface BaseDataService<T> {
  /**
   * Load data within a specific time range and bounding box
   * @param timeRange Optional time range as [startDate, endDate]
   * @param bbox Optional bounding box as [minX, minY, maxX, maxY]
   */
  loadData(timeRange?: [Date, Date], bbox?: [number, number, number, number]): Observable<T[]>;

  /**
   * Filter already loaded data
   * @param filter Custom filter parameters
   */
  filterData(filter: any): Observable<T[]>;

  /**
   * Clear the cache
   */
  clearCache(): void;
}

/**
 * Wikipedia article data interface
 */
export interface WikipediaArticle {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  pageid: number;
  coordinates?: {
    lat: number;
    lon: number;
  };
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WikipediaDataService implements BaseDataService<WikipediaArticle> {
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
  private geoSearchUrl = 'https://en.wikipedia.org/w/api.php';

  // Cache for article data
  private articleCache = new Map<string, WikipediaArticle>();

  // Cache for geo-search results
  private geoSearchCache = new Map<string, WikipediaArticle[]>();

 
  constructor(private http: HttpClient) { }

  /**
   * Get a short summary for a specific Wikipedia article
   * @param title The title of the Wikipedia article
   * @returns Observable containing the article extract
   */
  getShortInfo(title: string): Observable<string> {
    // Check cache first
    const cachedArticle = this.articleCache.get(title);
    if (cachedArticle) {
      return of(cachedArticle.extract || 'No summary available.');
    }

    const url = `${this.baseUrl}${encodeURIComponent(title)}`;
    return this.http.get<any>(url).pipe(
      tap(response => {
        // Cache the article data
        this.articleCache.set(title, {
          title: response.title,
          extract: response.extract,
          pageid: response.pageid,
          thumbnail: response.thumbnail,
        });
      }),
      map(response => response.extract || 'No summary available.'),
      catchError(_ => of('Failed to load Wikipedia info.')),
      // Share the same response with multiple subscribers
      shareReplay(1)
    );
  }

  /**
   * Get full article data including summary and metadata
   * @param title The title of the Wikipedia article
   * @returns Observable containing the full article data
   */
  getArticle(title: string): Observable<WikipediaArticle> {
    // Check cache first
    const cachedArticle = this.articleCache.get(title);
    if (cachedArticle) {
      return of(cachedArticle);
    }

    const url = `${this.baseUrl}${encodeURIComponent(title)}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        const article: WikipediaArticle = {
          title: response.title,
          extract: response.extract || 'No summary available.',
          pageid: response.pageid,
          thumbnail: response.thumbnail,
          coordinates: response.coordinates
        };

        // Cache the article
        this.articleCache.set(title, article);

        return article;
      }),
      catchError(_ => {
        const errorArticle: WikipediaArticle = {
          title,
          extract: 'Failed to load Wikipedia info.',
          pageid: 0
        };
        return of(errorArticle);
      }),
      shareReplay(1)
    );
  }

  /**
   * Implementation of BaseDataService.loadData
   * Loads Wikipedia articles based on geographic area and optional time constraints
   * @param timeRange Optional time range filter
   * @param bbox Bounding box as [west, south, east, north]
   * @returns Observable array of WikipediaArticles
   */
  loadData(
    timeRange?: [Date, Date],
    bbox?: [number, number, number, number]
  ): Observable<WikipediaArticle[]> {
    if (!bbox) {
      return of([]);  // No bbox provided, return empty array
    }

    // Create a cache key from the bbox and timeRange
    const cacheKey = `${bbox.join(',')}|${timeRange ? timeRange[0].getTime() + '-' + timeRange[1].getTime() : 'all'}`;

    // Check cache first
    if (this.geoSearchCache.has(cacheKey)) {
      return of(this.geoSearchCache.get(cacheKey) || []);
    }

    // Construct parameters for the Wikipedia GeoSearch API
    const params = {
      action: 'query',
      list: 'geosearch',
      gscoord: `${(bbox[1] + bbox[3]) / 2}|${(bbox[0] + bbox[2]) / 2}`, // center point
      gsradius: '10000', // 10km radius
      gslimit: '50',     // max 50 results
      format: 'json',
      origin: '*',       // needed for CORS
    };

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    return this.http.get<any>(`${this.geoSearchUrl}?${queryParams.toString()}`).pipe(
      map(response => {
        const articles: WikipediaArticle[] = [];

        if (response.query && response.query.geosearch) {
          response.query.geosearch.forEach((item: any) => {
            const article: WikipediaArticle = {
              title: item.title,
              extract: '', // We'll need to fetch these separately if needed
              pageid: item.pageid,
              coordinates: {
                lat: item.lat,
                lon: item.lon
              }
            };
            articles.push(article);

            // Also cache individual articles
            this.articleCache.set(item.title, article);
          });
        }

        // Apply time filtering if provided
        const filteredArticles = timeRange
          ? this.filterByTimeRange(articles, timeRange)
          : articles;

        // Cache the results
        this.geoSearchCache.set(cacheKey, filteredArticles);

        return filteredArticles;
      }),
      catchError(_ => {
        console.error('Error loading Wikipedia geosearch data');
        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * Implementation of BaseDataService.filterData
   * Filters already loaded data based on criteria
   * @param filter Filter criteria object with any of: text, maxResults, minLength
   * @returns Observable array of filtered WikipediaArticles
   */
  filterData(filter: {
    text?: string,
    maxResults?: number,
    minLength?: number,
    bbox?: [number, number, number, number],
    timeRange?: [Date, Date]
  }): Observable<WikipediaArticle[]> {
    // Start with all cached articles
    let articles: WikipediaArticle[] = [];
    this.articleCache.forEach(article => articles.push(article));

    // Apply text filter
    if (filter.text) {
      const searchText = filter.text.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchText) ||
        article.extract.toLowerCase().includes(searchText)
      );
    }

    // Apply minimum length filter
    if (filter.minLength) {
      articles = articles.filter(article =>
        article.extract.length >= filter.minLength!
      );
    }

    // Apply bbox filter if provided
    if (filter.bbox) {
      articles = articles.filter(article => {
        if (!article.coordinates) return false;

        const [west, south, east, north] = filter.bbox!;
        const { lat, lon } = article.coordinates;

        return lat >= south && lat <= north &&
          lon >= west && lon <= east;
      });
    }

    // Apply time range filter
    if (filter.timeRange) {
      articles = this.filterByTimeRange(articles, filter.timeRange);
    }

    // Apply max results limit
    if (filter.maxResults && articles.length > filter.maxResults) {
      articles = articles.slice(0, filter.maxResults);
    }

    return of(articles);
  }

  /**
   * Clear service cache
   */
  clearCache(): void {
    this.articleCache.clear();
    this.geoSearchCache.clear();
  }

  /**
   * Helper method to filter articles by time range
   * Note: This is a placeholder implementation as most Wikipedia articles
   * might not have an associated timestamp in this implementation
   */
  private filterByTimeRange(
    articles: WikipediaArticle[],
    timeRange: [Date, Date]
  ): WikipediaArticle[] {
    const [start, end] = timeRange;

    return articles.filter(article => {
      // Skip articles without timestamp
      if (!article.timestamp) return true;

      const timestamp = article.timestamp;
      return timestamp >= start && timestamp <= end;
    });
  }

  /**
   * Search for Wikipedia articles by keywords
   * @param query Search query
   * @param limit Maximum number of results (default: 10)
   */
  searchArticles(query: string, limit: number = 10): Observable<WikipediaArticle[]> {
    const params = {
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      srlimit: limit.toString(),
      origin: '*'
    };

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    return this.http.get<any>(`${this.geoSearchUrl}?${queryParams.toString()}`).pipe(
      map(response => {
        const articles: WikipediaArticle[] = [];

        if (response.query && response.query.search) {
          response.query.search.forEach((item: any) => {
            const article: WikipediaArticle = {
              title: item.title,
              extract: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
              pageid: item.pageid,
              timestamp: new Date(item.timestamp)
            };
            articles.push(article);

            // Cache the article
            this.articleCache.set(item.title, article);
          });
        }

        return articles;
      }),
      catchError(_ => {
        console.error('Error searching Wikipedia articles');
        return of([]);
      }),
      shareReplay(1)
    );
  }
}
