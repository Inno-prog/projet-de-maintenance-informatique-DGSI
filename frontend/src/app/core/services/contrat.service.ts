import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Contrat, StatutContrat } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private API_URL = `${environment.apiUrl}/contrats`;

  constructor(private http: HttpClient) {}

  getAllContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.API_URL);
  }

  getContratById(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.API_URL}/${id}`);
  }

  createContrat(contrat: Contrat): Observable<Contrat> {
    return this.http.post<Contrat>(this.API_URL, contrat);
  }

  updateContrat(id: number, contrat: Contrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.API_URL}/${id}`, contrat);
  }

  deleteContrat(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getContratsByPrestataire(prestataireId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.API_URL}/prestataire/${prestataireId}`);
  }

  updateContratStatut(id: number, statut: StatutContrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.API_URL}/${id}/statut`, statut);
  }
}
