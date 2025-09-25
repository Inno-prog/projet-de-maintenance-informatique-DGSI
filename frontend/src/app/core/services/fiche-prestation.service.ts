import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FichePrestation } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FichePrestationService {
  private API_URL = `${environment.apiUrl}/fiches-prestation`;

  constructor(private http: HttpClient) {}

  getAllFiches(): Observable<FichePrestation[]> {
    return this.http.get<FichePrestation[]>(this.API_URL);
  }

  getFicheById(id: number): Observable<FichePrestation> {
    return this.http.get<FichePrestation>(`${this.API_URL}/${id}`);
  }

  createFiche(fiche: FichePrestation): Observable<FichePrestation> {
    return this.http.post<FichePrestation>(this.API_URL, fiche);
  }

  updateFiche(id: number, fiche: FichePrestation): Observable<FichePrestation> {
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}`, fiche);
  }

  deleteFiche(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  validerFiche(id: number, commentaires?: string): Observable<FichePrestation> {
    const params = commentaires ? `?commentaires=${commentaires}` : '';
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}/valider${params}`, {});
  }

  rejeterFiche(id: number, commentaires?: string): Observable<FichePrestation> {
    const params = commentaires ? `?commentaires=${commentaires}` : '';
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}/rejeter${params}`, {});
  }
}