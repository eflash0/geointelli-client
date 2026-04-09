import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Parcel } from '../../models/parcel';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ParcelService {

  private baseUrl = 'http://localhost:8081/api/parcels';

  constructor(private http: HttpClient) {}

  getParcels(bbox: string): Observable<Parcel[]> {
    const params = new HttpParams().set('bbox', bbox);
  
    return this.http.get<Parcel[]>(this.baseUrl, { params });
  }
}
