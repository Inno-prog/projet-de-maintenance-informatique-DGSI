import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, retry, timeout } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Prestation {
  id?: number;
  nomPrestataire: string;
  nomPrestation: string;
  montantPrest: number;
  equipementsUtilises: number;
  quantiteItem?: number; // Kept for backward compatibility
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
  private apiUrl = `${environment.apiUrl}/prestations`;

  constructor(private http: HttpClient) {}

  getAllPrestations(): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('❌ Erreur chargement prestations:', error);
        return of([]); // Retourner tableau vide
      })
    );
  }

  getPrestationById(id: number): Observable<Prestation> {
    return this.http.get<Prestation>(`${this.apiUrl}/${id}`);
  }

  // CRÉER une prestation
  createPrestation(prestationData: any): Observable<any> {
    console.log('🔄 Création prestation:', prestationData);
    
    return this.http.post<any>(this.apiUrl, prestationData).pipe(
      timeout(15000),
      tap(response => console.log('✅ Prestation créée:', response)),
      catchError(this.handleCreateError)
    );
  }

  updatePrestation(id: number, prestation: Prestation): Observable<Prestation> {
    return this.http.put<Prestation>(`${this.apiUrl}/${id}`, prestation);
  }

  deletePrestation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPrestationsByPrestataire(nomPrestataire: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/prestataire/${nomPrestataire}`);
  }

  getPrestationsByStatut(statut: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getPrestationsByTrimestre(trimestre: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/trimestre/${trimestre}`);
  }

  searchPrestations(keyword: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  getCountByStatut(statut: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/statut/${statut}`);
  }

  getTotalMontantByTrimestre(trimestre: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/montant/trimestre/${trimestre}`);
  }

  getCountByItemTrimestrePrestataire(nomPrestation: string, trimestre: string, nomPrestataire: string, statut?: string): Observable<number> {
    let url = `${this.apiUrl}/count/${encodeURIComponent(nomPrestation)}/${encodeURIComponent(trimestre)}/${encodeURIComponent(nomPrestataire)}`;
    if (statut) {
      url += `?statut=${encodeURIComponent(statut)}`;
    }
    return this.http.get<number>(url);
  }

  getCountByItemAndTrimestre(nomItem: string, trimestre: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${encodeURIComponent(nomItem)}/${encodeURIComponent(trimestre)}`);
  }

  // COMPTER les prestations par item
  getCountByItem(nomItem: string): Observable<number> {
    if (!nomItem || nomItem.trim() === '') {
      console.warn('⚠️ Nom d\'item vide pour countByItem');
      return of(0);
    }

    // Encodage correct du paramètre
    const encodedNomItem = encodeURIComponent(nomItem);
    const params = new HttpParams().set('nomItem', encodedNomItem);
    
    const url = `${this.apiUrl}/count-by-item`;
    console.log(`🔍 GET ${url}?nomItem=${encodedNomItem}`);

    return this.http.get<number>(url, { params }).pipe(
      timeout(10000), // Timeout de 10s
      retry(2), // 2 tentatives
      tap(count => console.log(`✅ Count reçu pour "${nomItem}": ${count}`)),
      catchError(this.handleCountError(nomItem))
    );
  }

  // Gestion d'erreur pour le comptage
  private handleCountError(nomItem: string) {
    return (error: HttpErrorResponse) => {
      console.error(`❌ Erreur count pour "${nomItem}":`, error);
      
      let errorMessage = 'Erreur lors du comptage';
      if (error.status === 404) {
        errorMessage = 'Endpoint de comptage non trouvé';
      } else if (error.status === 400) {
        errorMessage = 'Paramètre invalide';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur lors du comptage';
      } else if (error.status === 0) {
        errorMessage = 'Timeout lors du comptage';
      }
      
      console.warn(`⚠️ Retourne 0 pour ${nomItem} due à: ${errorMessage}`);
      return of(0); // Toujours retourner 0 en cas d'erreur
    };
  }

  // Gestion d'erreur pour la création
  private handleCreateError(error: HttpErrorResponse) {
    console.error('❌ Erreur création prestation:', error);
    
    let userMessage = 'Erreur lors de la création';
    
    if (error.status === 400) {
      // Erreur de validation backend
      if (error.error && error.error.message) {
        userMessage = error.error.message;
      } else {
        userMessage = 'Données invalides';
      }
    } else if (error.status === 500) {
      userMessage = 'Erreur serveur - Contactez l\'administrateur';
    } else if (error.status === 0) {
      userMessage = 'Impossible de se connecter au serveur';
    }
    
    return throwError(() => new Error(userMessage));
  }

}
