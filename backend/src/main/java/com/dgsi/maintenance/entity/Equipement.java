package com.dgsi.maintenance.entity;

import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "equipements")
public class Equipement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "nom_equipement")
    private String nomEquipement;

    @Column(name = "description", length = 1000)
    private String description;

    @NotBlank
    @Column(name = "marque")
    private String marque;

    @Column(name = "prix_unitaire")
    private Float prixUnitaire;

    @Column(name = "quantite_disponible")
    private Integer quantiteDisponible;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "prestation_equipement",
        joinColumns = @JoinColumn(name = "equipement_id"),
        inverseJoinColumns = @JoinColumn(name = "prestation_id")
    )
    private Set<Prestation> prestations = new HashSet<>();

    // Constructeurs
    public Equipement() {}

    public Equipement(String nomEquipement, String description, String marque,
                     Float prixUnitaire, Integer quantiteDisponible) {
        this.nomEquipement = nomEquipement;
        this.description = description;
        this.marque = marque;
        this.prixUnitaire = prixUnitaire;
        this.quantiteDisponible = quantiteDisponible;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomEquipement() { return nomEquipement; }
    public void setNomEquipement(String nomEquipement) { this.nomEquipement = nomEquipement; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public Float getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(Float prixUnitaire) { this.prixUnitaire = prixUnitaire; }

    public Integer getQuantiteDisponible() { return quantiteDisponible; }
    public void setQuantiteDisponible(Integer quantiteDisponible) { this.quantiteDisponible = quantiteDisponible; }

    public Set<Prestation> getPrestations() { return prestations; }
    public void setPrestations(Set<Prestation> prestations) { this.prestations = prestations; }
}
