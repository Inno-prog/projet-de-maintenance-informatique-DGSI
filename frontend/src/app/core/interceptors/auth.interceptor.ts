import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);

  // Skip adding Authorization header for OAuth2 endpoints
  if (req.url.includes('/oauth2/') || req.url.includes('keycloak')) {
    return next(req);
  }

  // Add Authorization header with JWT token from Keycloak
  if (oauthService.hasValidAccessToken()) {
    const token = oauthService.getAccessToken();
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(authReq);
    }
  }

  return next(req);
};