import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OrdreCommande } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdreCommandeService {
  private API_URL = `${environment.apiUrl}/ordres-commande`;

  constructor(private http: HttpClient) {}

  getAllOrdresCommande(): Observable<OrdreCommande[]> {
    return this.http.get<OrdreCommande[]>(this.API_URL);
  }

  getOrdreCommandeById(id: number): Observable<OrdreCommande> {
    return this.http.get<OrdreCommande>(`${this.API_URL}/${id}`);
  }

  createOrdreCommande(ordre: OrdreCommande): Observable<OrdreCommande> {
    return this.http.post<OrdreCommande>(this.API_URL, ordre);
  }

  updateOrdreCommande(id: number, ordre: OrdreCommande): Observable<OrdreCommande> {
    return this.http.put<OrdreCommande>(`${this.API_URL}/${id}`, ordre);
  }

  deleteOrdreCommande(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  approuverOrdre(id: number): Observable<OrdreCommande> {
    return this.http.put<OrdreCommande>(`${this.API_URL}/${id}/approuver`, {});
  }

  rejeterOrdre(id: number): Observable<OrdreCommande> {
    return this.http.put<OrdreCommande>(`${this.API_URL}/${id}/rejeter`, {});
  }
}