Development auth notes

This project includes a development-only fallback to avoid 400/401 errors when Keycloak is not available locally.

How it works:
- `frontend/src/environments/environment.ts` contains `devAuthBypass: true` by default for local development.
- When the OAuth discovery fails and `devAuthBypass` is true, the frontend will generate "fake" access_token/id_token JWTs (unsigned) with a 24h expiry and store them in `localStorage`.
- This allows the UI to extract claims and continue running even if Keycloak is down.

Important security notes:
- DO NOT enable `devAuthBypass` in production. Ensure `environment.production` is set to `true` in production builds.
- Fake tokens are not signed. They are strictly for local development and testing.

Recommended local setup:
1. Start Keycloak if you need to test real authentication (`./start-keycloak-local.sh`).
2. Start the backend (`mvn spring-boot:run` in `backend/`).
3. Start the frontend in the `frontend` folder: `npm run start`.

If Keycloak is down and you still want the frontend to work, keep `devAuthBypass: true` and the frontend will create a local dev session.

Silent refresh:
- A `silent-refresh.html` page has been added at `frontend/src/silent-refresh.html`. The OAuth config sets `silentRefreshRedirectUri` to this page to support silent refresh in browsers.

If you want me to run a full E2E test (start backend + Keycloak + frontend and walk through login), tell me and I will attempt to start services here (I may need permission to start Keycloak locally).