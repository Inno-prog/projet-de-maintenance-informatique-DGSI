package com.dgsi.maintenance.controller;

import java.util.List;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.StatutContrat;
import com.dgsi.maintenance.repository.ContratRepository;
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
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContratController {

    @Autowired
    private ContratRepository contratRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<Contrat>> getAllContrats() {
        try {
            log.info("Tentative de récupération de tous les contrats");
            List<Contrat> contrats = contratRepository.findAll();
            log.info("Nombre de contrats récupérés: {}", contrats.size());
            return ResponseEntity.ok(contrats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des contrats: ", e);
            return ResponseEntity.internalServerError().build();
        }
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

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContratStatut(@PathVariable Long id, @RequestBody String statutStr) {
        try {
            log.info("Tentative de mise à jour du statut du contrat {} vers {}", id, statutStr);
            StatutContrat statut = StatutContrat.valueOf(statutStr);
            return contratRepository.findById(id)
                .map(contrat -> {
                    contrat.setStatut(statut);
                    Contrat savedContrat = contratRepository.save(contrat);
                    log.info("Statut du contrat {} mis à jour avec succès", id);
                    return ResponseEntity.ok(savedContrat);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du statut du contrat {}: ", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
