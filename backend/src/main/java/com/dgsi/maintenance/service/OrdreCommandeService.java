package com.dgsi.maintenance.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.entity.StatutCommande;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
public class OrdreCommandeService {

    private final AtomicLong numeroSequence = new AtomicLong(1);

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private PrestationRepository prestationRepository;

    /**
     * Crée automatiquement un ordre de commande avec gestion transactionnelle
     */
    @Transactional
    public OrdreCommande creerOuObtenirOrdreCommandePourPrestation(Prestation prestation) {
        log.info("🔄 Création automatique OC pour prestation: {} - Prestataire: {} - Trimestre: {}",
                prestation.getNomPrestation(), prestation.getNomPrestataire(), prestation.getTrimestre());

        try {
            // Validation des données obligatoires
            validerPrestation(prestation);

            // Recherche d'un OC existant actif pour ce prestataire/trimestre
            Optional<OrdreCommande> ordreExistant = trouverOrdreCommandeActif(
                prestation.getNomPrestataire(),
                prestation.getTrimestre()
            );

            if (ordreExistant.isPresent()) {
                log.info("📦 Utilisation OC existant ID: {}", ordreExistant.get().getId());
                return ajouterPrestationAOrdreExistant(ordreExistant.get(), prestation);
            } else {
                log.info("🆕 Création nouvel OC pour prestataire: {}", prestation.getNomPrestataire());
                return creerNouvelOrdreCommandeAvecPrestation(prestation);
            }

        } catch (Exception e) {
            log.error("❌ Erreur création OC pour prestation {}: {}", prestation.getNomPrestation(), e.getMessage());
            // Ne pas relancer l'exception pour éviter le rollback de la prestation
            throw new RuntimeException("Erreur lors de la création de l'ordre de commande: " + e.getMessage(), e);
        }
    }

    /**
     * Validation des données de la prestation
     */
    private void validerPrestation(Prestation prestation) {
        if (prestation == null) {
            throw new IllegalArgumentException("La prestation ne peut pas être nulle");
        }
        if (prestation.getNomPrestataire() == null || prestation.getNomPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du prestataire est obligatoire");
        }
        if (prestation.getTrimestre() == null || prestation.getTrimestre().trim().isEmpty()) {
            throw new IllegalArgumentException("Le trimestre est obligatoire");
        }
        if (prestation.getNomPrestation() == null || prestation.getNomPrestation().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de la prestation est obligatoire");
        }
    }

    /**
     * Recherche d'un ordre de commande actif
     */
    private Optional<OrdreCommande> trouverOrdreCommandeActif(String prestataire, String trimestre) {
        return ordreCommandeRepository
            .findByPrestataireItemAndTrimestreAndStatutIn(
                prestataire,
                trimestre,
                List.of(StatutCommande.EN_ATTENTE, StatutCommande.EN_COURS)
            )
            .stream()
            .findFirst();
    }

    /**
     * Ajoute une prestation à un ordre de commande existant
     */
    private OrdreCommande ajouterPrestationAOrdreExistant(OrdreCommande ordre, Prestation prestation) {
        // Initialiser la liste si nécessaire
        if (ordre.getPrestations() == null) {
            ordre.setPrestations(new ArrayList<>());
        }

        // Vérifier si la prestation n'existe pas déjà
        boolean prestationExiste = ordre.getPrestations().stream()
            .anyMatch(p -> p.getId() != null && p.getId().equals(prestation.getId()));

        if (!prestationExiste) {
            ordre.getPrestations().add(prestation);
            prestation.setOrdreCommande(ordre);

            // Mettre à jour les montants et statistiques
            mettreAJourOrdreCommandeAvecPrestation(ordre, prestation);

            log.info("✅ Prestation ajoutée à l'OC ID: {}", ordre.getId());
            return ordreCommandeRepository.save(ordre);
        } else {
            log.warn("⚠️ Prestation déjà présente dans l'OC ID: {}", ordre.getId());
            return ordre;
        }
    }

    /**
     * Crée un nouvel ordre de commande avec la prestation
     */
    private OrdreCommande creerNouvelOrdreCommandeAvecPrestation(Prestation prestation) {
        OrdreCommande ordreCommande = new OrdreCommande();

        // Génération des identifiants uniques
        String numeroOC = genererNumeroOrdreCommandeUnique();
        ordreCommande.setNumeroOc(numeroOC.hashCode()); // Conversion to Integer
        ordreCommande.setIdOC(numeroOC);
        ordreCommande.setNumeroCommande(numeroOC);

        // Informations de base
        ordreCommande.setNomItem(prestation.getNomPrestation());
        ordreCommande.setPrestataireItem(prestation.getNomPrestataire());
        ordreCommande.setTrimestre(prestation.getTrimestre());

        ordreCommande.setPrixUnitPrest(prestation.getMontantPrest() != null ?
            prestation.getMontantPrest().floatValue() : 0.0f);

        // Calcul des montants initiaux
        initialiserMontantsOrdreCommande(ordreCommande, prestation);

        // Statut et dates
        ordreCommande.setStatut(StatutCommande.EN_ATTENTE);
        ordreCommande.setDateCreation(LocalDateTime.now());
        ordreCommande.setDateModification(LocalDateTime.now());

        // Save ordre first without prestations to ensure it's inserted
        OrdreCommande savedOrdre = ordreCommandeRepository.save(ordreCommande);
        ordreCommandeRepository.flush(); // Ensure the ordre is inserted before setting relationships

        // Now set the relationship on the prestation and save it to update the foreign key
        prestation.setOrdreCommande(savedOrdre);
        prestationRepository.save(prestation);

        log.info("✅ Nouvel OC créé avec ID: {} - Numéro: {}", savedOrdre.getId(), numeroOC);

        return savedOrdre;
    }

    /**
     * Initialise les montants de l'ordre de commande
     */
    private void initialiserMontantsOrdreCommande(OrdreCommande ordre, Prestation prestationInitiale) {
        float prixUnit = ordre.getPrixUnitPrest() != null ? ordre.getPrixUnitPrest() : 0.0f;

        ordre.setNombreArticlesUtilise(1);
        ordre.setMontantOc(prixUnit);
        ordre.setMontant((double) prixUnit);

        // Statistiques initiales
        ordre.setTotalPrestationsRealisees(1);
        ordre.setPourcentageAvancement(0.0f); // À calculer selon la logique métier

        // Mettre à jour min et max basé sur la formule
        updateMinMaxPrestations(ordre);
    }

    /**
     * Met à jour l'ordre de commande après ajout d'une prestation
     */
    private void mettreAJourOrdreCommandeAvecPrestation(OrdreCommande ordre, Prestation nouvellePrestation) {
        int nombrePrestations = ordre.getPrestations().size();
        float prixUnit = ordre.getPrixUnitPrest() != null ? ordre.getPrixUnitPrest() : 0.0f;

        // Mise à jour des montants
        ordre.setMontantOc(prixUnit * nombrePrestations);
        ordre.setMontant((double) (prixUnit * nombrePrestations));
        ordre.setNombreArticlesUtilise(nombrePrestations);

        // Mise à jour des statistiques
        ordre.setTotalPrestationsRealisees(nombrePrestations);
        ordre.setDateModification(LocalDateTime.now());

        // Mettre à jour min et max basé sur la formule
        updateMinMaxPrestations(ordre);

        // Recalcul du pourcentage d'avancement (exemple)
        if (ordre.getMax_prestations() > 0) {
            float pourcentage = (nombrePrestations * 100.0f) / ordre.getMax_prestations();
            ordre.setPourcentageAvancement(Math.min(pourcentage, 100.0f));
        }
    }

    /**
     * Génère un numéro d'ordre de commande unique et lisible
     */
    private String genererNumeroOrdreCommandeUnique() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String sequence = String.format("%04d", numeroSequence.getAndIncrement() % 10000);
        return "OC-" + timestamp.substring(7) + "-" + sequence;
    }

    /**
     * Calcule et met à jour les valeurs Min et Max pour un OrdreCommande
     * Min = nombre total de prestations créées pour cet item (tous trimestres)
     * Max = Quantité Max Trimestre de l'item (valeur fixe)
     */
    private void updateMinMaxPrestations(OrdreCommande ordre) {
        String item = ordre.getNomItem();

        if (item == null) {
            log.warn("Impossible de calculer Min/Max : nom d'item manquant pour OC ID {}", ordre.getId());
            return;
        }

        // Compter le nombre total de prestations pour cet item (TOUS LES TRIMESTRES)
        Long totalPrestations = prestationRepository.countByNomPrestation(item);

        // Trouver l'Item pour obtenir quantiteMaxTrimestre
        Item itemEntity = itemRepository.findFirstByNomItem(item).orElse(null);
        Integer quantiteMax = (itemEntity != null) ? itemEntity.getQuantiteMaxTrimestre() : 0;

        // CORRECTION : Max = quantiteMaxTrimestre (valeur fixe de l'item)
        ordre.setMin_prestations(totalPrestations.intValue());
        ordre.setMax_prestations(quantiteMax); // ← Valeur fixe de l'item

        log.info("Min/Max calculés pour OC ID {} - Item: {} : Min={}, Max={} (Quantité Max Item: {})",
            ordre.getId(), item, ordre.getMin_prestations(), ordre.getMax_prestations(), quantiteMax);
    }

    // === MÉTHODES DE GESTION SUPPLÉMENTAIRES ===

    /**
     * Récupère tous les ordres de commande avec leurs prestations
     */
    @Transactional(readOnly = true)
    public List<OrdreCommande> getAllOrdresCommande() {
        return ordreCommandeRepository.findAllWithPrestations();
    }

    /**
     * Récupère les ordres de commande d'un prestataire spécifique
     */
    @Transactional(readOnly = true)
    public List<OrdreCommande> getOrdresCommandeByPrestataire(String prestataire) {
        return ordreCommandeRepository.findByPrestataireItem(prestataire);
    }

    /**
     * Met à jour le statut d'un ordre de commande avec validation
     */
    public OrdreCommande updateStatutOrdreCommande(Long id, StatutCommande nouveauStatut) {
        return ordreCommandeRepository.findById(id)
            .map(ordre -> {
                if (ordre.getStatut() != nouveauStatut) {
                    ordre.setStatut(nouveauStatut);
                    ordre.setDateModification(LocalDateTime.now());
                    log.info("🔄 Statut OC {} mis à jour: {} → {}", id, ordre.getStatut(), nouveauStatut);
                    return ordreCommandeRepository.save(ordre);
                }
                return ordre;
            })
            .orElseThrow(() -> new RuntimeException("❌ Ordre de commande non trouvé avec l'ID: " + id));
    }

    /**
     * Supprime un ordre de commande avec vérification
     */
    public void deleteOrdreCommande(Long id) {
        if (ordreCommandeRepository.existsById(id)) {
            ordreCommandeRepository.deleteById(id);
            log.info("🗑️ Ordre de commande supprimé: {}", id);
        } else {
            log.warn("⚠️ Tentative de suppression d'un OC inexistant: {}", id);
        }
    }

    /**
     * Récupère le détail complet d'un ordre de commande
     */
    @Transactional(readOnly = true)
    public Optional<OrdreCommande> getOrdreCommandeDetail(Long id) {
        return ordreCommandeRepository.findByIdWithPrestations(id);
    }
}