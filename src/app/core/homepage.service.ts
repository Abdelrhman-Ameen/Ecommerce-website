import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, HomepageData } from './models';

@Injectable({ providedIn: 'root' })
export class HomepageService {
  constructor(private http: HttpClient) {}
  get(): Observable<HomepageData> {
    return this.http.get<ApiResponse<HomepageData>>('/api/v1/site/homepage').pipe(map((response) => response.data));
  }
}
