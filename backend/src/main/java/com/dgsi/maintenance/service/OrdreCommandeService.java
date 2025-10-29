package com.dgsi.maintenance.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
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
     * CORRECTION : Méthode principale pour gérer l'ordre de commande
     * S'assure que les prestations d'un même prestataire/trimestre sont groupées
     */
    @Transactional
    public OrdreCommande gererOrdreCommandePourPrestation(Prestation prestation) {
        log.info("🔄 Gestion OC pour prestation: {} - Prestataire: {} - Trimestre: {}",
                prestation.getNomPrestation(), prestation.getNomPrestataire(), prestation.getTrimestre());

        try {
            validerPrestation(prestation);

            // CORRECTION : Recherche TOUS les OC existants pour ce prestataire/trimestre
            // (pas seulement les actifs, pour éviter la duplication)
            Optional<OrdreCommande> ordreExistant = trouverOrdreCommandeParPrestataireEtTrimestre(
                prestation.getNomPrestataire(),
                prestation.getTrimestre()
            );

            if (ordreExistant.isPresent()) {
                log.info("📦 Ajout à OC existant ID: {} - Prestataire: {} - Trimestre: {}",
                        ordreExistant.get().getId(), prestation.getNomPrestataire(), prestation.getTrimestre());
                return ajouterPrestationAOrdreExistant(ordreExistant.get(), prestation);
            } else {
                log.info("🆕 Création nouvel OC - Prestataire: {} - Trimestre: {}",
                        prestation.getNomPrestataire(), prestation.getTrimestre());
                return creerNouvelOrdreCommandeAvecPrestation(prestation);
            }

        } catch (Exception e) {
            log.error("❌ Erreur gestion OC pour prestation {}: {}", prestation.getNomPrestation(), e.getMessage());
            throw new RuntimeException("Erreur lors de la gestion de l'ordre de commande: " + e.getMessage(), e);
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
     * CORRECTION : Recherche par prestataire ET trimestre (tous statuts)
     */
    private Optional<OrdreCommande> trouverOrdreCommandeParPrestataireEtTrimestre(String prestataire, String trimestre) {
        List<OrdreCommande> ordres = ordreCommandeRepository.findByPrestataireItemAndTrimestre(prestataire, trimestre);

        // Priorité aux ordres actifs, sinon prendre le premier disponible
        return ordres.stream()
            .filter(oc -> oc.getStatut() == StatutCommande.EN_ATTENTE || oc.getStatut() == StatutCommande.EN_COURS)
            .findFirst()
            .or(() -> ordres.stream().findFirst());
    }

    /**
     * CORRECTION : Ajout sécurisé d'une prestation avec gestion des doublons
     */
    private OrdreCommande ajouterPrestationAOrdreExistant(OrdreCommande ordre, Prestation nouvellePrestation) {
        // Initialiser la liste si nécessaire
        if (ordre.getPrestations() == null) {
            ordre.setPrestations(new ArrayList<>());
        }

        // Vérification de doublon plus robuste
        boolean prestationExiste = ordre.getPrestations().stream()
            .anyMatch(p -> p.getId() != null && p.getId().equals(nouvellePrestation.getId()) ||
                          (p.getNomPrestation().equals(nouvellePrestation.getNomPrestation()) &&
                           p.getDateDebut().isEqual(nouvellePrestation.getDateDebut())));

        if (!prestationExiste) {
            // CORRECTION : Sauvegarder d'abord la prestation avec la référence à l'ordre
            nouvellePrestation.setOrdreCommande(ordre);
            Prestation prestationSauvegardee = prestationRepository.save(nouvellePrestation);

            // Puis ajouter à la liste
            ordre.getPrestations().add(prestationSauvegardee);

            // Mise à jour des statistiques
            mettreAJourOrdreCommandeAvecPrestation(ordre, nouvellePrestation);

            // Mise à jour du statut basé sur les prestations
            ordre.setStatut(ordre.getStatutFromPrestations());

            OrdreCommande ordreMisAJour = ordreCommandeRepository.save(ordre);
            log.info("✅ Prestation ajoutée à l'OC ID: {} - Total prestations: {}",
                    ordre.getId(), ordre.getPrestations().size());

            return ordreMisAJour;
        } else {
            log.warn("⚠️ Prestation déjà présente dans l'OC ID: {}", ordre.getId());
            return ordre;
        }
    }

    /**
     * CORRECTION : Création avec gestion améliorée des relations
     */
    private OrdreCommande creerNouvelOrdreCommandeAvecPrestation(Prestation prestation) {
        OrdreCommande ordreCommande = new OrdreCommande();

        // Génération des identifiants
        String numeroOC = genererNumeroOrdreCommandeUnique();
        ordreCommande.setNumeroOc(numeroOC.hashCode());
        ordreCommande.setIdOC(numeroOC);
        ordreCommande.setNumeroCommande(numeroOC);

        // Informations de base (PRESTATAIRE + TRIMESTRE comme clé de regroupement)
        ordreCommande.setNomItem("Commande multiple - " + prestation.getNomPrestataire()); // Nom générique
        ordreCommande.setPrestataireItem(prestation.getNomPrestataire());
        ordreCommande.setTrimestre(prestation.getTrimestre());

        // Prix unitaire moyen (à ajuster selon la logique métier)
        ordreCommande.setPrixUnitPrest(prestation.getMontantPrest() != null ?
            prestation.getMontantPrest().floatValue() : 0.0f);

        // Initialisation avec la première prestation
        initialiserMontantsOrdreCommande(ordreCommande, prestation);

        // Statut et dates
        ordreCommande.setStatut(StatutCommande.EN_ATTENTE);
        ordreCommande.setDateCreation(LocalDateTime.now());
        ordreCommande.setDateModification(LocalDateTime.now());

        // CORRECTION : Créer l'ordre d'abord
        OrdreCommande savedOrdre = ordreCommandeRepository.save(ordreCommande);

        // Puis associer la prestation
        prestation.setOrdreCommande(savedOrdre);
        prestationRepository.save(prestation);

        // Initialiser la liste des prestations
        savedOrdre.setPrestations(new ArrayList<>());
        savedOrdre.getPrestations().add(prestation);

        log.info("✅ Nouvel OC créé - ID: {} - Numéro: {} - Prestataire: {} - Trimestre: {}",
                savedOrdre.getId(), numeroOC, prestation.getNomPrestataire(), prestation.getTrimestre());

        return ordreCommandeRepository.save(savedOrdre);
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

        // Mise à jour du statut basé sur les prestations
        ordre.setStatut(ordre.getStatutFromPrestations());
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
     * NOUVEAU : Récupère tous les ordres groupés par prestataire
     */
    @Transactional(readOnly = true)
    public Map<String, List<OrdreCommande>> getOrdresCommandeGroupesParPrestataire() {
        List<OrdreCommande> tousLesOrdres = ordreCommandeRepository.findAllWithPrestations();

        return tousLesOrdres.stream()
            .collect(Collectors.groupingBy(
                OrdreCommande::getPrestataireItem,
                Collectors.toList()
            ));
    }

    /**
     * NOUVEAU : Récupère les statistiques par prestataire
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistiquesParPrestataire(String prestataire) {
        List<OrdreCommande> ordresPrestataire = ordreCommandeRepository.findByPrestataireItem(prestataire);

        Map<String, Object> stats = new HashMap<>();
        stats.put("prestataire", prestataire);
        stats.put("totalOrdres", ordresPrestataire.size());
        stats.put("totalPrestations", ordresPrestataire.stream()
            .mapToInt(oc -> oc.getPrestations() != null ? oc.getPrestations().size() : 0)
            .sum());
        stats.put("montantTotal", ordresPrestataire.stream()
            .mapToDouble(oc -> oc.getMontant() != null ? oc.getMontant() : 0.0)
            .sum());
        stats.put("ordreRecent", ordresPrestataire.stream()
            .max(Comparator.comparing(OrdreCommande::getDateCreation))
            .map(OrdreCommande::getNumeroCommande)
            .orElse("Aucun"));

        return stats;
    }

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