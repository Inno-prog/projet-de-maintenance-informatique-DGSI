package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutFiche;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fiches-prestation")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FichePrestationController {

    @Autowired
    private FichePrestationRepository ficheRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public List<FichePrestation> getAllFiches() {
        return ficheRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<FichePrestation> getFicheById(@PathVariable Long id) {
        return ficheRepository.findById(id)
            .map(fiche -> ResponseEntity.ok().body(fiche))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> createFiche(@RequestBody FichePrestation fiche) {
        try {
            FichePrestation saved = ficheRepository.save(fiche);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<FichePrestation> updateFiche(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        System.out.println("Mise à jour fiche ID: " + id);
        System.out.println("Données reçues: " + updates);

        return ficheRepository.findById(id)
            .map(fiche -> {
                try {
                    // Mettre à jour seulement les champs fournis
                    if (updates.containsKey("statut") && updates.get("statut") != null) {
                        String statutStr = updates.get("statut").toString();
                        System.out.println("Mise à jour statut: " + statutStr);
                        fiche.setStatut(StatutFiche.valueOf(statutStr));
                    }

                    FichePrestation saved = ficheRepository.save(fiche);
                    System.out.println("Fiche mise à jour avec succès: " + saved.getId());
                    return ResponseEntity.ok(saved);
                } catch (Exception e) {
                    System.err.println("Erreur lors de la mise à jour: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Erreur lors de la mise à jour de la fiche: " + e.getMessage());
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteFiche(@PathVariable Long id) {
        return ficheRepository.findById(id)
            .map(fiche -> {
                ficheRepository.delete(fiche);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('AGENT_DGSI')")
    public ResponseEntity<FichePrestation> validerFiche(@PathVariable Long id, @RequestParam(required = false) String commentaires) {
        return ficheRepository.findById(id)
            .map(fiche -> {
                fiche.setStatut(StatutFiche.VALIDER);
                if (commentaires != null) {
                    fiche.setCommentaire(commentaires);
                }
                return ResponseEntity.ok(ficheRepository.save(fiche));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('AGENT_DGSI')")
    public ResponseEntity<FichePrestation> rejeterFiche(@PathVariable Long id, @RequestParam(required = false) String commentaires) {
        return ficheRepository.findById(id)
            .map(fiche -> {
                fiche.setStatut(StatutFiche.REJETER);
                if (commentaires != null) {
                    fiche.setCommentaire(commentaires);
                }
                return ResponseEntity.ok(ficheRepository.save(fiche));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}