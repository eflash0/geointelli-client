import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private baseUrl = 'http://localhost:8081/api/properties';

  constructor(private http: HttpClient) {}

  getPropertyDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
