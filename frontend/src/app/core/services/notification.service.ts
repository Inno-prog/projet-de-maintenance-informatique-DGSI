import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  destinataire: string;
  titre: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  lu: boolean;
  dateCreation: string;
  prestationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(destinataire: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${destinataire}`);
  }

  marquerCommeLu(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/marquer-lu`, {});
  }

  notifierPrestationTerminee(prestataire: string, prestationId: number, nomItem: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/prestation-terminee`, null, {
      params: { prestataire, prestationId: prestationId.toString(), nomItem }
    });
  }
}