import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Parcel } from '../../models/parcel';
import { Property } from '../../models/property';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private baseUrl = 'http://localhost:8081/api/addresses';

  constructor(private http: HttpClient) {}

  search(raw: string): Observable<Property[]> {
    const params = new HttpParams().set('rawAddress', raw);
    return this.http.get<Property[]>(`${this.baseUrl}/search`, { params });
  }

  suggest(raw: string): Observable<string[]> {
    const params = new HttpParams().set('raw', raw.trim());
    return this.http.get<string[]>(`${this.baseUrl}/suggest`, { params });
  }
}
