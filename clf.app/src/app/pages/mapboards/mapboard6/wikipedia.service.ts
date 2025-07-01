import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WikipediaService {
  constructor(private http: HttpClient) { }

  // Example: fetch short info for a fixed title from Wikipedia's REST API
  getShortInfo(title: string): Observable<string> {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        // 'extract' contains the short summary text
        return response.extract || 'No summary available.';
      }),
      catchError((_) => of('Failed to load Wikipedia info.'))
    );
  }
}
