# TODO: Fix Equipement Entity and Add Welcome Endpoint

## Steps to Complete

1. **Update Equipement.java Entity**
   - Rename `typeEquipement` field to `marque`, update column name to "marque"
   - Remove @NotNull annotation from `prixUnitaire` and `quantiteDisponible` to make them optional
   - Add @JsonIgnore to `prestations` field to fix Jackson serialization loop
   - Update constructor, getters, and setters accordingly

2. **Add New Welcome Endpoint to EquipementController.java**
   - Add import for Logger and LoggerFactory
   - Add private static final Logger field
   - Add new @GetMapping("/welcome") method that logs request method and path, returns JSON welcome message
   - Use @PreAuthorize for ADMINISTRATEUR or PRESTATAIRE roles

3. **Restart Backend Application**
   - Since entity changes require restart, stop and restart the Spring Boot app

4. **Test API Endpoints**
   - Verify Equipement CRUD operations work without 415 errors
   - Test new /welcome endpoint and check logs for request metadata

5. **Update Frontend (if needed)**
   - Update business.models.ts to rename typeEquipement to marque
   - Make prixUnitaire and quantiteDisponible optional in forms and models
   - Ensure frontend handles FCFA values correctly
