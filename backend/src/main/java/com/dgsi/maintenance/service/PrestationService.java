package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PrestationService {

    private final PrestationRepository prestationRepository;
    private final ItemRepository itemRepository;
    private final OrdreCommandeService ordreCommandeService;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public PrestationService(PrestationRepository prestationRepository,
                           ItemRepository itemRepository,
                           OrdreCommandeService ordreCommandeService,
                           TransactionTemplate transactionTemplate) {
        this.prestationRepository = prestationRepository;
        this.itemRepository = itemRepository;
        this.ordreCommandeService = ordreCommandeService;
        this.transactionTemplate = transactionTemplate;
    }

    /**
     * Création robuste avec gestion d'erreur complète
     */
    public Prestation createPrestation(Prestation prestation) {
        log.info("🔄 Début création prestation: {}", prestation.getNomPrestation());

        // Validation avant la transaction
        try {
            validatePrestationData(prestation);
            checkQuantityLimit(prestation);
        } catch (IllegalArgumentException e) {
            log.warn("❌ Validation échouée: {}", e.getMessage());
            throw e; // Relancer pour le controller
        }

        // Transaction
        return transactionTemplate.execute(status -> {
            try {
                // CORRECTION : Gestion ordre de commande (regroupement par prestataire/trimestre)
                try {
                    log.info("📦 Gestion ordre de commande...");
                    OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(prestation);
                    prestation.setOrdreCommande(ordre);
                    log.info("✅ Ordre de commande géré - ID: {}", ordre.getId());
                } catch (Exception e) {
                    log.warn("⚠️ Gestion ordre de commande échouée, mais prestation sauvegardée. ID: {}", prestation.getId(), e);
                    // Continuer même si l'ordre de commande échoue
                }

                log.info("💾 Sauvegarde de la prestation...");
                Prestation savedPrestation = prestationRepository.save(prestation);
                log.info("✅ Prestation sauvegardée ID: {}", savedPrestation.getId());

                return savedPrestation;

            } catch (Exception e) {
                log.error("❌ Erreur lors de la sauvegarde transactionnelle", e);
                status.setRollbackOnly();
                throw new RuntimeException("Erreur technique lors de la création: " + e.getMessage(), e);
            }
        });
    }


    /**
     * Validation robuste des données
     */
    private void validatePrestationData(Prestation prestation) {
        log.info("🔍 Validation des données...");
        
        if (prestation == null) {
            throw new IllegalArgumentException("La prestation ne peut pas être nulle");
        }
        
        // Validation nom prestation
        if (prestation.getNomPrestation() == null || prestation.getNomPrestation().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de la prestation est obligatoire");
        }
        
        // Validation nom prestataire
        if (prestation.getNomPrestataire() == null || prestation.getNomPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du prestataire est obligatoire");
        }
        
        // Validation trimestre
        if (prestation.getTrimestre() == null || prestation.getTrimestre().trim().isEmpty()) {
            throw new IllegalArgumentException("Le trimestre est obligatoire");
        }
        
        // Validation montant
        if (prestation.getMontantPrest() == null || prestation.getMontantPrest().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant doit être positif");
        }
        
        // Vérifier que l'item existe
        String nomItem = prestation.getNomPrestation();
        if (!itemRepository.existsByNomItem(nomItem)) {
            throw new IllegalArgumentException("L'item '" + nomItem + "' n'existe pas dans la base de données");
        }
        
        log.info("✅ Validation des données OK");
    }

    /**
     * Vérification de limite améliorée
     */
    private void checkQuantityLimit(Prestation prestation) {
        String nomItem = prestation.getNomPrestation();
        log.info("🔍 Vérification limite pour: {}", nomItem);

        Optional<Item> itemOpt = itemRepository.findFirstByNomItem(nomItem);

        if (itemOpt.isEmpty()) {
            log.error("❌ Item non trouvé: {}", nomItem);
            throw new IllegalArgumentException("Item '" + nomItem + "' non trouvé");
        }

        Item item = itemOpt.get();
        Integer quantiteMax = item.getQuantiteMaxTrimestre();

        // Pas de limite si quantiteMax est null, 0 ou négatif
        if (quantiteMax == null || quantiteMax <= 0) {
            log.info("📝 Pas de limite pour {} (quantiteMax: {})", nomItem, quantiteMax);
            return;
        }

        // Compter les prestations existantes
        Long count;
        try {
            count = prestationRepository.countByNomPrestation(nomItem);
            log.info("📊 Statistiques - Item: {}, Existantes: {}, Max: {}", nomItem, count, quantiteMax);
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage pour {}", nomItem, e);
            throw new RuntimeException("Erreur technique lors de la vérification des limites");
        }

        if (count >= quantiteMax) {
            String errorMessage = String.format(
                "Limite atteinte pour '%s' (%d/%d prestations)",
                nomItem, count, quantiteMax
            );
            log.warn("🚫 {}", errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }

        log.info("✅ Limite OK: {}/{}", count, quantiteMax);
    }

    /**
     * Méthode de mise à jour avec gestion transactionnelle
     */
    @Transactional
    public Prestation updatePrestation(Long id, Prestation prestationDetails) {
        log.info("🔄 Mise à jour prestation ID: {}", id);

        return prestationRepository.findById(id)
            .map(prestation -> {
                try {
                    // Validation des données de mise à jour
                    if (prestationDetails.getNomPrestation() != null) {
                        prestation.setNomPrestation(prestationDetails.getNomPrestation());
                    }
                    if (prestationDetails.getNomPrestataire() != null) {
                        prestation.setNomPrestataire(prestationDetails.getNomPrestataire());
                    }
                    if (prestationDetails.getMontantPrest() != null) {
                        prestation.setMontantPrest(prestationDetails.getMontantPrest());
                    }
                    if (prestationDetails.getTrimestre() != null) {
                        prestation.setTrimestre(prestationDetails.getTrimestre());
                    }
                    if (prestationDetails.getDateDebut() != null) {
                        prestation.setDateDebut(prestationDetails.getDateDebut());
                    }
                    if (prestationDetails.getDateFin() != null) {
                        prestation.setDateFin(prestationDetails.getDateFin());
                    }
                    if (prestationDetails.getStatut() != null) {
                        prestation.setStatut(prestationDetails.getStatut());
                    }
                    if (prestationDetails.getDescription() != null) {
                        prestation.setDescription(prestationDetails.getDescription());
                    }

                    Prestation updatedPrestation = prestationRepository.save(prestation);
                    log.info("✅ Prestation mise à jour ID: {}", id);

                    return updatedPrestation;

                } catch (Exception e) {
                    log.error("❌ Erreur lors de la mise à jour de la prestation ID: {}", id, e);
                    throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage(), e);
                }
            })
            .orElseThrow(() -> {
                log.warn("⚠️ Prestation non trouvée pour mise à jour ID: {}", id);
                return new IllegalArgumentException("Prestation non trouvée avec ID: " + id);
            });
    }

    /**
     * Méthode de suppression sécurisée
     */
    @Transactional
    public boolean deletePrestation(Long id) {
        log.info("🔄 Suppression prestation ID: {}", id);

        return prestationRepository.findById(id)
            .map(prestation -> {
                try {
                    // Vérifier s'il y a des dépendances
                    if (prestation.getOrdreCommande() != null) {
                        log.warn("⚠️ Prestation ID: {} a un ordre de commande associé", id);
                        // Décider selon votre logique métier :
                        // - Soit supprimer aussi l'ordre de commande
                        // - Soit lever une exception
                        // - Soit simplement dissocier
                        prestation.setOrdreCommande(null);
                    }

                    prestationRepository.delete(prestation);
                    log.info("✅ Prestation supprimée ID: {}", id);
                    return true;

                } catch (Exception e) {
                    log.error("❌ Erreur lors de la suppression de la prestation ID: {}", id, e);
                    throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
                }
            })
            .orElse(false);
    }

    /**
     * Récupération avec gestion d'erreur
     */
    @Transactional(readOnly = true)
    public List<Prestation> getAllPrestations() {
        try {
            return prestationRepository.findAll();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations", e);
            throw new RuntimeException("Erreur lors de la récupération des prestations", e);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Prestation> getPrestationById(Long id) {
        try {
            return prestationRepository.findById(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation ID: {}", id, e);
            throw new RuntimeException("Erreur lors de la récupération de la prestation", e);
        }
    }

    /**
     * Comptage avec gestion d'erreur robuste
     */
    @Transactional(readOnly = true)
    public Long countByNomPrestation(String nomItem) {
        log.info("🔍 Comptage des prestations pour: {}", nomItem);
        
        try {
            // Vérifier que l'item existe d'abord
            if (!itemRepository.existsByNomItem(nomItem)) {
                log.warn("⚠️ Item non trouvé lors du comptage: {}", nomItem);
                return 0L;
            }
            
            Long count = prestationRepository.countByNomPrestation(nomItem);
            log.info("✅ Count pour {}: {}", nomItem, count);
            return count;
            
        } catch (Exception e) {
            log.error("❌ Erreur critique lors du comptage pour: {}", nomItem, e);
            return 0L; // Retourner 0 plutôt que de faire échouer la requête
        }
    }
}
