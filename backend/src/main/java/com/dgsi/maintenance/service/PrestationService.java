package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrestationService {

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OrdreCommandeService ordreCommandeService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a prestation and check the item's total max limit in a single transaction.
     * Throws PrestationLimitExceededException if limit already reached.
     */
    @Transactional
    public Prestation createPrestationTransactional(Prestation prestation) {
        // Find item
        java.util.Optional<Item> itemOptional = itemRepository.findFirstByNomItem(prestation.getNomPrestation());
        if (itemOptional.isEmpty()) {
            throw new IllegalArgumentException("Item non trouvé: " + prestation.getNomPrestation());
        }
        Item item = itemOptional.get();

        // Count existing prestations for this item (all prestataires, all trimestres)
        long countPrestationsForItem = prestationRepository.countByNomPrestation(prestation.getNomPrestation());

        Integer max = item.getQuantiteMaxTrimestre();
        if (max != null && countPrestationsForItem >= max) {
            // Notify and throw specific exception
            notificationService.envoyerNotificationLimitAtteint(prestation.getNomPrestataire(), prestation.getNomPrestation());
            throw new PrestationLimitExceededException("Le nombre limite de prestations pour cet item est atteint");
        }

        // Save prestation
        Prestation saved = prestationRepository.save(prestation);

        // Create/attach OrdreCommande (may throw but we don't want to rollback for it)
        try {
            ordreCommandeService.creerOuObtenirOrdreCommandePourPrestation(saved);
        } catch (Exception e) {
            // log & ignore to avoid failing the entire transaction
            System.err.println("Erreur OC post-creation: " + e.getMessage());
        }

        return saved;
    }
}
