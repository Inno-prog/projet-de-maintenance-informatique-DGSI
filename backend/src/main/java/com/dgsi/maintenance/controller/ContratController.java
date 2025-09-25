package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.repository.ContratRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContratController {

    @Autowired
    private ContratRepository contratRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Contrat> getAllContrats() {
        return contratRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Contrat> getContratById(@PathVariable Long id) {
        return contratRepository.findById(id)
            .map(contrat -> ResponseEntity.ok().body(contrat))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> createContrat(@Valid @RequestBody Contrat contrat) {
        if (contratRepository.existsByIdContrat(contrat.getIdContrat())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(contratRepository.save(contrat));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContrat(@PathVariable Long id, @Valid @RequestBody Contrat contratDetails) {
        return contratRepository.findById(id)
            .map(contrat -> {
                contrat.setTypeContrat(contratDetails.getTypeContrat());
                contrat.setDateDebut(contratDetails.getDateDebut());
                contrat.setDateFin(contratDetails.getDateFin());
                contrat.setNomPrestataire(contratDetails.getNomPrestataire());
                contrat.setMontant(contratDetails.getMontant());
                return ResponseEntity.ok(contratRepository.save(contrat));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteContrat(@PathVariable Long id) {
        return contratRepository.findById(id)
            .map(contrat -> {
                contratRepository.delete(contrat);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataire/{prestataireId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and #prestataireId == authentication.principal.id)")
    public List<Contrat> getContratsByPrestataire(@PathVariable String prestataireId) {
        return contratRepository.findByPrestataireId(prestataireId);
    }
}