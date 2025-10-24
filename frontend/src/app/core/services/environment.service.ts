import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  // Configuration centrale des URLs
  private readonly config = {
    apiBaseUrl: 'http://localhost:8081/api',
    endpoints: {
      prestations: '/fiches-prestation',
      users: '/users',
      contrats: '/contrats',
      ordres: '/ordres-commande',
      evaluations: '/evaluations'
    }
  };

  getApiUrl(endpointKey: keyof typeof this.config.endpoints): string {
    return this.config.apiBaseUrl + this.config.endpoints[endpointKey];
  }

  getFullUrl(endpointKey: keyof typeof this.config.endpoints, path: string = ''): string {
    return this.getApiUrl(endpointKey) + path;
  }

  // Vérifier la connectivité
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}