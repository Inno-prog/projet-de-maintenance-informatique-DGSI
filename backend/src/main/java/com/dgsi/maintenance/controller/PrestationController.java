package com.dgsi.maintenance.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.entity.StatutCommande;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import com.dgsi.maintenance.service.EvaluationService;
import com.dgsi.maintenance.service.OrdreCommandeService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prestations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PrestationController {

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OrdreCommandeService ordreCommandeService;

    @Autowired
    private com.dgsi.maintenance.service.PrestationService prestationService;

    @Autowired
    private EvaluationService evaluationService;
    

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping
    // @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')") // Disabled for development
    public ResponseEntity<?> createPrestation(@RequestBody Prestation prestation) {
        try {
            Prestation saved = prestationService.createPrestationTransactional(prestation);
            return ResponseEntity.ok().body(saved);
        } catch (com.dgsi.maintenance.service.PrestationLimitExceededException ple) {
            // Specific message to indicate the limit is reached
            return ResponseEntity.badRequest().body(ple.getMessage());
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de la prestation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de la création de la prestation: " + e.getMessage());
        }
    }

    // Debug endpoint to try mapping raw JSON to Prestation and return any mapping error messages
    @PostMapping("/debug")
    public ResponseEntity<?> debugMapPrestation(@RequestBody String raw) {
        try {
            Prestation p = objectMapper.readValue(raw, Prestation.class);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            // Return the exception message to help debug deserialization issues
            return ResponseEntity.badRequest().body("Deserialization error: " + e.getMessage());
        }
    }

    @GetMapping
    // @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')") // Disabled for development
    public List<Prestation> getAllPrestations() {
        return prestationRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Prestation> getPrestationById(@PathVariable Long id) {
        return prestationRepository.findById(id)
            .map(prestation -> ResponseEntity.ok().body(prestation))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataire/{nomPrestataire}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public List<Prestation> getPrestationsByPrestataire(@PathVariable String nomPrestataire) {
        return prestationRepository.findByNomPrestataire(nomPrestataire);
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public List<Prestation> getPrestationsByStatut(@PathVariable String statut) {
        return prestationRepository.findByStatut(statut);
    }

    @GetMapping("/trimestre/{trimestre}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public List<Prestation> getPrestationsByTrimestre(@PathVariable String trimestre) {
        return prestationRepository.findByTrimestre(trimestre);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<Prestation> updatePrestation(@PathVariable Long id, @RequestBody Prestation prestationDetails) {
        return prestationRepository.findById(id)
            .map(prestation -> {
                prestation.setNomPrestataire(prestationDetails.getNomPrestataire());
                prestation.setNomPrestation(prestationDetails.getNomPrestation());
                prestation.setMontantPrest(prestationDetails.getMontantPrest());
                prestation.setQuantiteItem(prestationDetails.getQuantiteItem());
                prestation.setNbPrestRealise(prestationDetails.getNbPrestRealise());
                prestation.setTrimestre(prestationDetails.getTrimestre());
                prestation.setDateDebut(prestationDetails.getDateDebut());
                prestation.setDateFin(prestationDetails.getDateFin());
                prestation.setStatut(prestationDetails.getStatut());
                prestation.setDescription(prestationDetails.getDescription());
                Prestation savedPrestation = prestationRepository.save(prestation);

                // If status is 'terminé', update the order status to TERMINE, set nbPrestRealise to quantiteItem, update totalPrestationsRealisees, and create evaluation
                if ("terminé".equals(prestationDetails.getStatut())) {
                    // Set nbPrestRealise to quantiteItem when prestation is completed
                    savedPrestation.setNbPrestRealise(savedPrestation.getQuantiteItem());

                    if (savedPrestation.getOrdreCommande() != null) {
                        // Update totalPrestationsRealisees in OrdreCommande
                        OrdreCommande ordreCommande = savedPrestation.getOrdreCommande();
                        Integer currentRealisees = ordreCommande.getTotalPrestationsRealisees() != null ? ordreCommande.getTotalPrestationsRealisees() : 0;
                        ordreCommande.setTotalPrestationsRealisees(currentRealisees + savedPrestation.getQuantiteItem());
                        ordreCommandeService.updateStatutOrdreCommande(savedPrestation.getOrdreCommande().getId(), StatutCommande.TERMINE);

                        // Create a basic evaluation for the prestataire
                        EvaluationTrimestrielle evaluation = new EvaluationTrimestrielle();
                        evaluation.setPrestataireNom(savedPrestation.getNomPrestataire());
                        evaluation.setTrimestre(savedPrestation.getTrimestre());
                        evaluation.setDateEvaluation(LocalDate.now());
                        evaluation.setStatut("en cours"); // Or appropriate status
                        evaluation.setNoteFinale(BigDecimal.ZERO); // Default
                        evaluation.setPenalitesCalcul(BigDecimal.ZERO);
                        evaluationService.saveEvaluation(evaluation);
                    }
                }

                return ResponseEntity.ok(savedPrestation);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deletePrestation(@PathVariable Long id) {
        return prestationRepository.findById(id)
            .map(prestation -> {
                prestationRepository.delete(prestation);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public List<Prestation> searchPrestations(@RequestParam String keyword) {
        return prestationRepository.searchByKeyword(keyword);
    }

    @GetMapping("/stats/statut/{statut}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public Long getCountByStatut(@PathVariable String statut) {
        return prestationRepository.countByStatut(statut);
    }

    @GetMapping("/stats/montant/trimestre/{trimestre}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public Long getTotalMontantByTrimestre(@PathVariable String trimestre) {
        return prestationRepository.sumMontantByTrimestre(trimestre);
    }

    @GetMapping("/count/{nomPrestation}/{trimestre}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public Long getCountByItemAndTrimestre(@PathVariable String nomPrestation, @PathVariable String trimestre) {
        return prestationRepository.countByTrimestreAndNomPrestation(trimestre, nomPrestation);
    }

    @GetMapping("/count/{nomPrestation}/{trimestre}/{nomPrestataire}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public Long getCountByItemTrimestrePrestataire(@PathVariable String nomPrestation, @PathVariable String trimestre, @PathVariable String nomPrestataire) {
        return prestationRepository.countByTrimestreAndNomPrestationAndNomPrestataire(trimestre, nomPrestation, nomPrestataire);
    }

    @GetMapping("/count/{nomPrestation}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public Long getCountByItem(@PathVariable String nomPrestation) {
        return prestationRepository.countByNomPrestation(nomPrestation);
    }

    @GetMapping("/count/{nomPrestation}/{nomPrestataire}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public Long getCountByItemAndPrestataire(@PathVariable String nomPrestation, @PathVariable String nomPrestataire) {
        return prestationRepository.countByNomPrestationAndNomPrestataire(nomPrestation, nomPrestataire);
    }
}
