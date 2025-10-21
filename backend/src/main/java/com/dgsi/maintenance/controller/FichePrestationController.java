package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutFiche;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.repository.ContratRepository;
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
    
    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    @Autowired
    private ContratRepository contratRepository;

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
            // Save the fiche prestation
            FichePrestation saved = ficheRepository.save(fiche);

            // After saving the fiche, ensure there is an OrdreCommande for this prestataire for the current trimestre
            String prestataireName = fiche.getNomPrestataire();
            String trimestre = determineTrimestre(fiche.getDateRealisation());

            java.util.Optional<com.dgsi.maintenance.entity.OrdreCommande> existOc =
                    ordreCommandeRepository.findFirstByTrimestreAndPrestataireItem(trimestre, prestataireName);

            com.dgsi.maintenance.entity.OrdreCommande oc;
            if (!existOc.isPresent()) {
                // Create a minimal OrdreCommande for the trimestre
                oc = new com.dgsi.maintenance.entity.OrdreCommande();
                oc.setTrimestre(trimestre);
                oc.setPrestataireItem(prestataireName);
                // Map trimestre to numeroOc (T1 -> 1 ... T4 -> 4)
                int numero = trimestreToNumero(trimestre);
                oc.setNumeroOc(numero);
                oc.setIdOC("OC" + numero);

                // Optionally link to a contract for this prestataire (pick first match)
                java.util.List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAll();
                for (com.dgsi.maintenance.entity.Contrat c : contrats) {
                    if (prestataireName != null && prestataireName.equals(c.getNomPrestataire())) {
                        oc.setContrat(c);
                        break;
                    }
                }

                // initialize counter
                oc.setNombreArticlesUtilise(1);
                ordreCommandeRepository.save(oc);
            } else {
                oc = existOc.get();
                // increment the counter of prestations (use nombreArticlesUtilise as a counter)
                Integer current = oc.getNombreArticlesUtilise();
                oc.setNombreArticlesUtilise((current == null ? 0 : current) + 1);
                ordreCommandeRepository.save(oc);
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création: " + e.getMessage());
        }
    }

    private String determineTrimestre(java.time.LocalDateTime date) {
        int month = date.getMonthValue();
        if (month >= 1 && month <= 3) return "T1";
        if (month >= 4 && month <= 6) return "T2";
        if (month >= 7 && month <= 9) return "T3";
        return "T4";
    }

    private int trimestreToNumero(String trimestre) {
        switch (trimestre) {
            case "T1": return 1;
            case "T2": return 2;
            case "T3": return 3;
            default: return 4;
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