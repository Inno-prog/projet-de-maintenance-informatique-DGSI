import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  uploadContrats(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.http.post<string[]>(`${this.apiUrl}/upload/contrats`, formData);
  }

  uploadRapports(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.http.post<string[]>(`${this.apiUrl}/upload/rapports`, formData);
  }

  downloadFile(folder: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${folder}/${filename}`, {
      responseType: 'blob'
    });
  }
}