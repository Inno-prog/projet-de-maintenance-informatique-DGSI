package com.dgsi.maintenance.entity;

import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_item", unique = true)
    private Integer idItem;

    @NotBlank
    @Column(name = "nom_item")
    private String nomItem;

    @Column(name = "description", length = 1000)
    private String description;

    @NotNull
    @Column(name = "prix")
    private Float prix;

    @NotNull
    @Column(name = "qte_equip_defini")
    private Integer qteEquipDefini;

    @NotNull
    @Column(name = "quantite_max_trimestre")
    private Integer quantiteMaxTrimestre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id")
    private OrdreCommande ordreCommande;

    @JsonBackReference
    @ManyToMany(mappedBy = "itemsUtilises", fetch = FetchType.LAZY)
    private Set<Prestation> prestations = new HashSet<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getIdItem() { return idItem; }
    public void setIdItem(Integer idItem) { this.idItem = idItem; }

    public String getNomItem() { return nomItem; }
    public void setNomItem(String nomItem) { this.nomItem = nomItem; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Float getPrix() { return prix; }
    public void setPrix(Float prix) { this.prix = prix; }

    public Integer getQteEquipDefini() { return qteEquipDefini; }
    public void setQteEquipDefini(Integer qteEquipDefini) { this.qteEquipDefini = qteEquipDefini; }

    public Integer getQuantiteMaxTrimestre() { return quantiteMaxTrimestre; }
    public void setQuantiteMaxTrimestre(Integer quantiteMaxTrimestre) { this.quantiteMaxTrimestre = quantiteMaxTrimestre; }

    public OrdreCommande getOrdreCommande() { return ordreCommande; }
    public void setOrdreCommande(OrdreCommande ordreCommande) { this.ordreCommande = ordreCommande; }

    public Set<Prestation> getPrestations() { return prestations; }
    public void setPrestations(Set<Prestation> prestations) { this.prestations = prestations; }
}
