import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DemandeIntervention } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DemandeInterventionService {
  private API_URL = `${environment.apiUrl}/demandes-intervention`;

  constructor(private http: HttpClient) {}

  getAllDemandes(): Observable<DemandeIntervention[]> {
    return this.http.get<DemandeIntervention[]>(this.API_URL);
  }

  getDemandeById(id: number): Observable<DemandeIntervention> {
    return this.http.get<DemandeIntervention>(`${this.API_URL}/${id}`);
  }

  createDemande(demande: DemandeIntervention): Observable<DemandeIntervention> {
    return this.http.post<DemandeIntervention>(this.API_URL, demande);
  }

  updateDemande(id: number, demande: DemandeIntervention): Observable<DemandeIntervention> {
    return this.http.put<DemandeIntervention>(`${this.API_URL}/${id}`, demande);
  }

  deleteDemande(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  assignerTechnicien(id: number, technicien: string): Observable<DemandeIntervention> {
    return this.http.put<DemandeIntervention>(`${this.API_URL}/${id}/assigner?technicien=${technicien}`, {});
  }
}