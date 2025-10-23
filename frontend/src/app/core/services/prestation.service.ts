import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Prestation {
  id?: number;
  nomPrestataire: string;
  nomPrestation: string;
  montantPrest: number;
  quantiteItem: number; // Kept for backend compatibility, but not used in frontend form
  nbPrestRealise: number;
  trimestre: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  description?: string;
  ordreCommande?: {
    id: number;
    numeroCommande: string;
    statut: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrestationService {
  private API_URL = `${environment.apiUrl}/prestations`;

  constructor(private http: HttpClient) {}

  getAllPrestations(): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(this.API_URL);
  }

  getPrestationById(id: number): Observable<Prestation> {
    return this.http.get<Prestation>(`${this.API_URL}/${id}`);
  }

  createPrestation(prestation: Prestation): Observable<Prestation> {
    return this.http.post<Prestation>(this.API_URL, prestation);
  }

  updatePrestation(id: number, prestation: Prestation): Observable<Prestation> {
    return this.http.put<Prestation>(`${this.API_URL}/${id}`, prestation);
  }

  deletePrestation(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getPrestationsByPrestataire(nomPrestataire: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.API_URL}/prestataire/${nomPrestataire}`);
  }

  getPrestationsByStatut(statut: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.API_URL}/statut/${statut}`);
  }

  getPrestationsByTrimestre(trimestre: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.API_URL}/trimestre/${trimestre}`);
  }

  searchPrestations(keyword: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.API_URL}/search?keyword=${keyword}`);
  }

  getCountByStatut(statut: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/stats/statut/${statut}`);
  }

  getTotalMontantByTrimestre(trimestre: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/stats/montant/trimestre/${trimestre}`);
  }

  getCountByItemTrimestrePrestataire(nomPrestation: string, trimestre: string, nomPrestataire: string, statut?: string): Observable<number> {
    let url = `${this.API_URL}/count/${encodeURIComponent(nomPrestation)}/${encodeURIComponent(trimestre)}/${encodeURIComponent(nomPrestataire)}`;
    if (statut) {
      url += `?statut=${encodeURIComponent(statut)}`;
    }
    return this.http.get<number>(url);
  }

  getCountByItemAndTrimestre(nomItem: string, trimestre: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count/${encodeURIComponent(nomItem)}/${encodeURIComponent(trimestre)}`);
  }
}
