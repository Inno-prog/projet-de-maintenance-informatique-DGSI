import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TypeItem } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TypeItemService {
  private API_URL = `${environment.apiUrl}/type-items`;

  constructor(private http: HttpClient) {}

  getAllTypeItems(): Observable<TypeItem[]> {
    return this.http.get<TypeItem[]>(this.API_URL);
  }

  getTypeItemById(id: number): Observable<TypeItem> {
    return this.http.get<TypeItem>(`${this.API_URL}/${id}`);
  }

  getTypeItemsByLot(lot: string): Observable<TypeItem[]> {
    return this.http.get<TypeItem[]>(`${this.API_URL}/lot/${lot}`);
  }

  createTypeItem(item: Omit<TypeItem, 'id'>): Observable<TypeItem> {
    return this.http.post<TypeItem>(this.API_URL, item);
  }

  updateTypeItem(id: number, item: Partial<TypeItem>): Observable<TypeItem> {
    return this.http.put<TypeItem>(`${this.API_URL}/${id}`, item);
  }

  deleteTypeItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}