package com.dgsi.maintenance.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "prestations")
public class Prestation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @NotBlank
    @Column(name = "nom_prestation")
    private String nomPrestation;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "montant_prest", precision = 10, scale = 2)
    private BigDecimal montantPrest;

    @NotNull
    @Column(name = "quantite_item")
    private Integer quantiteItem;

    @NotNull
    @Column(name = "nb_prest_realise")
    private Integer nbPrestRealise;

    @NotBlank
    @Column(name = "trimestre")
    private String trimestre;

    @NotNull
    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @NotNull
    @Column(name = "date_fin")
    private LocalDate dateFin;

    @NotBlank
    @Column(name = "statut")
    private String statut;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id")
    private OrdreCommande ordreCommande;

    // Constructeurs
    public Prestation() {}

    public Prestation(String nomPrestataire, String nomPrestation, BigDecimal montantPrest,
                     Integer quantiteItem, Integer nbPrestRealise, String trimestre,
                     LocalDate dateDebut, LocalDate dateFin, String statut, String description) {
        this.nomPrestataire = nomPrestataire;
        this.nomPrestation = nomPrestation;
        this.montantPrest = montantPrest;
        this.quantiteItem = quantiteItem;
        this.nbPrestRealise = nbPrestRealise;
        this.trimestre = trimestre;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.statut = statut;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomPrestataire() { return nomPrestataire; }
    public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

    public String getNomPrestation() { return nomPrestation; }
    public void setNomPrestation(String nomPrestation) { this.nomPrestation = nomPrestation; }

    public BigDecimal getMontantPrest() { return montantPrest; }
    public void setMontantPrest(BigDecimal montantPrest) { this.montantPrest = montantPrest; }

    public Integer getQuantiteItem() { return quantiteItem; }
    public void setQuantiteItem(Integer quantiteItem) { this.quantiteItem = quantiteItem; }

    public Integer getNbPrestRealise() { return nbPrestRealise; }
    public void setNbPrestRealise(Integer nbPrestRealise) { this.nbPrestRealise = nbPrestRealise; }

    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OrdreCommande getOrdreCommande() { return ordreCommande; }
    public void setOrdreCommande(OrdreCommande ordreCommande) { this.ordreCommande = ordreCommande; }
}