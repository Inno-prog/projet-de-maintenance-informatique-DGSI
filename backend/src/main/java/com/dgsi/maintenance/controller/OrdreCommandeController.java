package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Map;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.StatutCommande;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.service.OrdreCommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ordres-commande")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class OrdreCommandeController {

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    @Autowired
    private OrdreCommandeService ordreCommandeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<OrdreCommande>> getAllOrdresCommande() {
        try {
            List<OrdreCommande> ordres = ordreCommandeService.getAllOrdresCommande();
            return ResponseEntity.ok(ordres);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des ordres de commande: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/par-prestataire")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public Map<String, List<OrdreCommande>> getOrdresCommandeGroupesParPrestataire() {
        return ordreCommandeService.getOrdresCommandeGroupesParPrestataire();
    }

    @GetMapping("/prestataire/{prestataire}/statistiques")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public Map<String, Object> getStatistiquesParPrestataire(@PathVariable String prestataire) {
        return ordreCommandeService.getStatistiquesParPrestataire(prestataire);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<OrdreCommande> getOrdreCommandeById(@PathVariable Long id) {
        return ordreCommandeService.getOrdreCommandeDetail(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> createOrdreCommande(@RequestBody OrdreCommande ordreCommande) {
        try {
            System.out.println("Creating ordre commande: " + ordreCommande.getNumeroOc());
            System.out.println("Data received: " + ordreCommande.toString());
            
            if (ordreCommandeRepository.existsByNumeroOc(ordreCommande.getNumeroOc())) {
                System.out.println("Numero commande already exists: " + ordreCommande.getNumeroOc());
                return ResponseEntity.badRequest().body("Le numéro de commande existe déjà");
            }
            
            OrdreCommande saved = ordreCommandeRepository.save(ordreCommande);
            System.out.println("Ordre commande created with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Error creating ordre commande: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de la création: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<OrdreCommande> updateOrdreCommande(@PathVariable Long id, @RequestBody OrdreCommande ordreDetails) {
        return ordreCommandeRepository.findById(id)
            .map(ordre -> {
                ordre.setNumeroOc(ordreDetails.getNumeroOc());
                ordre.setNomItem(ordreDetails.getNomItem());
                ordre.setMin_prestations(ordreDetails.getMin_prestations());
                ordre.setMax_prestations(ordreDetails.getMax_prestations());
                ordre.setPrixUnitPrest(ordreDetails.getPrixUnitPrest());
                ordre.setMontantOc(ordreDetails.getMontantOc());
                ordre.setObservations(ordreDetails.getObservations());
                ordre.setStatut(ordreDetails.getStatut());
                return ResponseEntity.ok(ordreCommandeRepository.save(ordre));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteOrdreCommande(@PathVariable Long id) {
        return ordreCommandeRepository.findById(id)
            .map(ordre -> {
                ordreCommandeRepository.delete(ordre);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approuver")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<OrdreCommande> approuverOrdre(@PathVariable Long id) {
        return ordreCommandeRepository.findById(id)
            .map(ordre -> {
                ordre.setStatut(StatutCommande.APPROUVE);
                return ResponseEntity.ok(ordreCommandeRepository.save(ordre));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<OrdreCommande> rejeterOrdre(@PathVariable Long id) {
        return ordreCommandeRepository.findById(id)
            .map(ordre -> {
                ordre.setStatut(StatutCommande.REJETE);
                return ResponseEntity.ok(ordreCommandeRepository.save(ordre));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Récupère tous les prestataires distincts
     */
    @GetMapping("/prestataires")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<String>> getAllPrestataires() {
        try {
            List<String> prestataires = ordreCommandeRepository.findDistinctPrestataires();
            return ResponseEntity.ok(prestataires);
        } catch (Exception e) {
            log.error("❌ Erreur récupération prestataires: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
