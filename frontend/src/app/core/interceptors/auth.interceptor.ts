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
      // Debug log to show that Authorization header will be attached
      // (kept at debug level; can be removed in production)
      console.debug('authInterceptor: attaching Bearer token to request', { url: req.url });
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(authReq);
    }
  }

  // Debug when no token is present
  console.debug('authInterceptor: no valid access token, sending request without Authorization', { url: req.url });
  return next(req);
};