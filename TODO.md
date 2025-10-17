# TODO: Remove Quantité Field and Change Validation Logic

## Backend Changes
- [x] Update PrestationController.createPrestation() to count prestations instead of summing quantities
- [x] Update validation logic to check if number of prestations >= quantiteMaxTrimestre

## Frontend Changes
- [x] Remove quantiteItem field from prestation-form.component.html
- [x] Remove quantiteItem from prestation-form.component.ts form group
- [x] Update validation messages and info messages
- [x] Update Prestation interface in business.models.ts if needed

## Testing
- [ ] Test that creating prestations respects the max count per trimestre
- [ ] Verify error messages when limit is reached
