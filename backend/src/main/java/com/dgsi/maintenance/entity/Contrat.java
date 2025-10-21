package com.dgsi.maintenance.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "contrats")
@JsonIgnoreProperties({"ordresCommande", "hibernateLazyInitializer", "handler"})
public class Contrat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "id_contrat", unique = true)
    private String idContrat;

    @NotBlank
    @Column(name = "type_contrat")
    private String typeContrat;

    @NotNull
    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @NotNull
    @Column(name = "date_fin")
    private LocalDate dateFin;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @NotNull
    @Column(name = "montant")
    private Double montant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;

    @OneToMany(mappedBy = "contrat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdreCommande> ordresCommande = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdContrat() { return idContrat; }
    public void setIdContrat(String idContrat) { this.idContrat = idContrat; }

    public String getTypeContrat() { return typeContrat; }
    public void setTypeContrat(String typeContrat) { this.typeContrat = typeContrat; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getNomPrestataire() { return nomPrestataire; }
    public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }

    public Prestataire getPrestataire() { return prestataire; }
    public void setPrestataire(Prestataire prestataire) { this.prestataire = prestataire; }

    public List<OrdreCommande> getOrdresCommande() { return ordresCommande; }
    public void setOrdresCommande(List<OrdreCommande> ordresCommande) { this.ordresCommande = ordresCommande; }
}