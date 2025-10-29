import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Equipement } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {
  private API_URL = `${environment.apiUrl}/equipements`;

  constructor(private http: HttpClient) {}

  getAllEquipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(this.API_URL);
  }

  getEquipementById(id: number): Observable<Equipement> {
    return this.http.get<Equipement>(`${this.API_URL}/${id}`);
  }

  searchEquipementsByName(nom: string): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.API_URL}/search?nom=${nom}`);
  }

  getEquipementsByType(type: string): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.API_URL}/type/${type}`);
  }

  createEquipement(equipement: Omit<Equipement, 'id'>): Observable<Equipement> {
    return this.http.post<Equipement>(this.API_URL, equipement);
  }

  updateEquipement(id: number, equipement: Partial<Equipement>): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.API_URL}/${id}`, equipement);
  }

  deleteEquipement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
