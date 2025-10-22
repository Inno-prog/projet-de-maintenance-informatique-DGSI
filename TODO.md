# TODO: Implement Authorized Prestations Limit

## Steps:
1. [x] Use `quantiteMaxTrimestre` as the authorized quantity (no new field needed)
2. [x] Add `envoyerNotificationLimitAtteint` method to NotificationService.java
3. [x] Update PrestationController.java:
   - [x] Inject NotificationService
   - [x] Modify createPrestation to check if count prestations in trimestre >= quantiteMaxTrimestre, send notification, and return bad request
   - [x] In updatePrestation, when status is "terminé", increment totalPrestationsRealisees in OrdreCommande by quantiteItem
