package com.dgsi.maintenance.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "ordres_commande")
@JsonIgnoreProperties({"contrat", "items", "hibernateLazyInitializer", "handler"})
public class OrdreCommande {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_oc", unique = true)
    private Integer numeroOc;

    @Column(name = "numero_commande")
    private String numeroCommande;

    @Column(name = "id_oc")
    private String idOC;

    @Column(name = "nom_item")
    private String nomItem;

    @Column(name = "min_prestations")
    private Integer min_prestations;

    @Column(name = "min_articles")
    private Integer minArticles;

    @Column(name = "max_prestations")
    private Integer max_prestations;

    @Column(name = "max_articles")
    private Integer maxArticles;

    @Column(name = "nombre_articles_utilise")
    private Integer nombreArticlesUtilise;

    @Column(name = "prix_unit_prest")
    private Float prixUnitPrest;

    @Column(name = "montant_oc")
    private Float montantOc;

    @Column(name = "montant")
    private Double montant;

    @Column(name = "observations")
    private String observations;

    @Column(name = "description")
    private String description;

    @Column(name = "trimestre")
    private String trimestre;

    @Column(name = "prestataire_item")
    private String prestataireItem;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "total_prestations_realisees")
    private Integer totalPrestationsRealisees;

    @Column(name = "pourcentage_avancement")
    private Float pourcentageAvancement;

    @NotNull
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;

    @JsonIgnore
    @OneToMany(mappedBy = "ordreCommande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Item> items = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "ordreCommande", cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
    private List<Prestation> prestations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (idOC == null || idOC.isEmpty()) {
            idOC = "OC-" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // No automatic calculation needed
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getNumeroOc() { return numeroOc; }
    public void setNumeroOc(Integer numeroOc) { this.numeroOc = numeroOc; }

    public String getIdOC() { return idOC; }
    public void setIdOC(String idOC) { this.idOC = idOC; }

    public String getNomItem() { return nomItem; }
    public void setNomItem(String nomItem) { this.nomItem = nomItem; }

    public Integer getMin_prestations() { return min_prestations; }
    public void setMin_prestations(Integer min_prestations) { this.min_prestations = min_prestations; }

    public Integer getMax_prestations() { return max_prestations; }
    public void setMax_prestations(Integer max_prestations) { this.max_prestations = max_prestations; }

    public Integer getMinArticles() { return minArticles; }
    public void setMinArticles(Integer minArticles) { this.minArticles = minArticles; }

    public Integer getMaxArticles() { return maxArticles; }
    public void setMaxArticles(Integer maxArticles) { this.maxArticles = maxArticles; }

    public Integer getNombreArticlesUtilise() { return nombreArticlesUtilise; }
    public void setNombreArticlesUtilise(Integer nombreArticlesUtilise) { this.nombreArticlesUtilise = nombreArticlesUtilise; }

    public Float getPrixUnitPrest() { return prixUnitPrest; }
    public void setPrixUnitPrest(Float prixUnitPrest) { this.prixUnitPrest = prixUnitPrest; }

    public Float getMontantOc() { return montantOc; }
    public void setMontantOc(Float montantOc) { this.montantOc = montantOc; }

    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

    public String getPrestataireItem() { return prestataireItem; }
    public void setPrestataireItem(String prestataireItem) { this.prestataireItem = prestataireItem; }

    public String getNumeroCommande() { return numeroCommande; }
    public void setNumeroCommande(String numeroCommande) { this.numeroCommande = numeroCommande; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    public Integer getTotalPrestationsRealisees() { return totalPrestationsRealisees; }
    public void setTotalPrestationsRealisees(Integer totalPrestationsRealisees) { this.totalPrestationsRealisees = totalPrestationsRealisees; }

    public Float getPourcentageAvancement() { return pourcentageAvancement; }
    public void setPourcentageAvancement(Float pourcentageAvancement) { this.pourcentageAvancement = pourcentageAvancement; }

    public StatutCommande getStatut() { return statut; }
    public void setStatut(StatutCommande statut) { this.statut = statut; }

    public Contrat getContrat() { return contrat; }
    public void setContrat(Contrat contrat) { this.contrat = contrat; }

    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }

    public List<Prestation> getPrestations() { return prestations; }
    public void setPrestations(List<Prestation> prestations) { this.prestations = prestations; }
    
    public int calculer_ecart_item() {
        if (prestations == null || prestations.isEmpty()) return 0;
        int realized = prestations.size();
        // Use max from items' quantiteMaxTrimestre
        int max = items != null && !items.isEmpty() ?
            items.stream()
                .mapToInt(item -> item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0)
                .max().orElse(0) : 0;
        return Math.max(0, max - realized);
    }

    public Float calcul_montantTotal() {
        if (prestations == null || prestations.isEmpty()) return 0.0f;
        return (float) prestations.stream()
            .mapToDouble(p -> p.getMontantPrest() != null ? p.getMontantPrest().doubleValue() : 0.0)
            .sum();
    }

    public Float calcul_penalite() {
        if (prestations == null || prestations.isEmpty()) return 0.0f;
        double realizedAmount = prestations.stream()
            .mapToDouble(p -> p.getMontantPrest() != null ? p.getMontantPrest().doubleValue() : 0.0)
            .sum();
        // Max amount based on items' quantiteMaxTrimestre * prix
        double maxAmount = items != null && !items.isEmpty() ?
            items.stream()
                .mapToDouble(item -> (item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0) *
                                    (item.getPrix() != null ? item.getPrix() : 0.0))
                .sum() : 0.0;
        return (float) Math.max(0, maxAmount - realizedAmount);
    }

    public String getItemsNames() {
        if (prestations == null || prestations.isEmpty()) return "";
        return prestations.stream()
            .filter(p -> p.getNomPrestation() != null)
            .map(p -> p.getNomPrestation())
            .distinct()
            .collect(Collectors.joining(", "));
    }

    public String getObservationsFromPrestations() {
        if (prestations == null || prestations.isEmpty()) return "";
        return prestations.stream()
            .filter(p -> p.getDescription() != null && !p.getDescription().trim().isEmpty())
            .map(p -> p.getDescription())
            .collect(Collectors.joining("; "));
    }

    public StatutCommande getStatutFromPrestations() {
        if (prestations == null || prestations.isEmpty()) return statut;
        boolean allTerminee = prestations.stream().allMatch(p -> "TERMINEE".equals(p.getStatut()));
        if (allTerminee) return StatutCommande.TERMINE;
        boolean anyEnCours = prestations.stream().anyMatch(p -> "EN_COURS".equals(p.getStatut()));
        if (anyEnCours) return StatutCommande.EN_COURS;
        return StatutCommande.EN_ATTENTE;
    }

    public int getEcartArticles() {
        if (maxArticles != null && minArticles != null) {
            return maxArticles - minArticles;
        }
        return 0;
    }

    @Override
    public String toString() {
        return "OrdreCommande{" +
                "id=" + id +
                ", numeroOc=" + numeroOc +
                ", idOC='" + idOC + '\'' +
                ", nomItem='" + nomItem + '\'' +
                ", min_prestations=" + min_prestations +
                ", max_prestations=" + max_prestations +
                ", prixUnitPrest=" + prixUnitPrest +
                ", montantOc=" + montantOc +
                ", observations='" + observations + '\'' +
                ", statut=" + statut +
                '}';
    }
}