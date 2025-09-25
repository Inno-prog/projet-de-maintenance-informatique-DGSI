package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.DemandeIntervention;
import com.dgsi.maintenance.entity.StatutDemande;
import com.dgsi.maintenance.repository.DemandeInterventionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes-intervention")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DemandeInterventionController {

    @Autowired
    private DemandeInterventionRepository demandeRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<DemandeIntervention> getAllDemandes() {
        return demandeRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<DemandeIntervention> getDemandeById(@PathVariable Long id) {
        return demandeRepository.findById(id)
            .map(demande -> ResponseEntity.ok().body(demande))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<?> createDemande(@RequestBody DemandeIntervention demande) {
        try {
            DemandeIntervention saved = demandeRepository.save(demande);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<?> updateDemande(@PathVariable Long id, @RequestBody DemandeIntervention demandeDetails) {
        try {
            return demandeRepository.findById(id)
                .map(demande -> {
                    demande.setPrestataireNom(demandeDetails.getPrestataireNom());
                    demande.setPrestataireContact(demandeDetails.getPrestataireContact());
                    demande.setObjet(demandeDetails.getObjet());
                    demande.setDescription(demandeDetails.getDescription());
                    demande.setCategorie(demandeDetails.getCategorie());
                    demande.setStatut(demandeDetails.getStatut());
                    demande.setTechnicienAssigne(demandeDetails.getTechnicienAssigne());
                    return ResponseEntity.ok(demandeRepository.save(demande));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteDemande(@PathVariable Long id) {
        return demandeRepository.findById(id)
            .map(demande -> {
                demandeRepository.delete(demande);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/assigner")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<DemandeIntervention> assignerTechnicien(@PathVariable Long id, @RequestParam String technicien) {
        return demandeRepository.findById(id)
            .map(demande -> {
                demande.setTechnicienAssigne(technicien);
                demande.setStatut(StatutDemande.EN_COURS);
                return ResponseEntity.ok(demandeRepository.save(demande));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}