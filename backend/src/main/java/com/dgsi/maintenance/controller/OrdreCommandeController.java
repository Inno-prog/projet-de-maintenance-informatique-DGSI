package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.StatutCommande;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordres-commande")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrdreCommandeController {

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<OrdreCommande> getAllOrdresCommande() {
        return ordreCommandeRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<OrdreCommande> getOrdreCommandeById(@PathVariable Long id) {
        return ordreCommandeRepository.findById(id)
            .map(ordre -> ResponseEntity.ok().body(ordre))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> createOrdreCommande(@RequestBody OrdreCommande ordreCommande) {
        try {
            System.out.println("Creating ordre commande: " + ordreCommande.getNumeroCommande());
            System.out.println("Data received: " + ordreCommande.toString());
            
            if (ordreCommandeRepository.existsByNumeroCommande(ordreCommande.getNumeroCommande())) {
                System.out.println("Numero commande already exists: " + ordreCommande.getNumeroCommande());
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
                ordre.setNumeroCommande(ordreDetails.getNumeroCommande());
                ordre.setNomItem(ordreDetails.getNomItem());
                ordre.setMinArticles(ordreDetails.getMinArticles());
                ordre.setMaxArticles(ordreDetails.getMaxArticles());
                ordre.setNombreArticlesUtilise(ordreDetails.getNombreArticlesUtilise());
                ordre.setTrimestre(ordreDetails.getTrimestre());
                ordre.setPrestataireItem(ordreDetails.getPrestataireItem());
                ordre.setMontant(ordreDetails.getMontant());
                ordre.setDescription(ordreDetails.getDescription());
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
}