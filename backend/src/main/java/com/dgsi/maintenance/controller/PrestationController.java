package com.dgsi.maintenance.controller;

import java.util.List;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
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

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<Prestation> createPrestation(@RequestBody Prestation prestation) {
        try {
            // Validate that the number of prestations for this item in this trimestre doesn't exceed the maximum
            Item item = itemRepository.findByNomItem(prestation.getNomPrestation());
            if (item == null) {
                return ResponseEntity.badRequest().build(); // Item not found
            }

            List<Prestation> existingPrestations = prestationRepository.findByTrimestre(prestation.getTrimestre());
            long countPrestationsForItem = existingPrestations.stream()
                .filter(p -> p.getNomPrestation().equals(prestation.getNomPrestation()))
                .count();

            if (countPrestationsForItem >= item.getQuantiteMaxTrimestre()) {
                return ResponseEntity.badRequest().build(); // Exceeds maximum number of prestations
            }

            // Sauvegarder d'abord la prestation
            Prestation savedPrestation = prestationRepository.save(prestation);

            // Créer automatiquement un ordre de commande pour cette prestation
            try {
                OrdreCommande ordreCommande = ordreCommandeService.creerOuObtenirOrdreCommandePourPrestation(savedPrestation);
                System.out.println("Ordre de commande créé/automatisé avec ID: " + ordreCommande.getId());
            } catch (Exception e) {
                System.err.println("Erreur lors de la création de l'ordre de commande: " + e.getMessage());
                // Ne pas échouer la création de prestation si l'ordre de commande échoue
            }

            return ResponseEntity.ok(savedPrestation);
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de la prestation: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
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
                return ResponseEntity.ok(prestationRepository.save(prestation));
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
}