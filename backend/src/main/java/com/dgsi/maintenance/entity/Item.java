package com.dgsi.maintenance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "code_item", unique = true)
    private String codeItem;

    @NotBlank
    private String libelle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_item_id")
    private TypeItem type;

    @NotNull
    private Double prix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id")
    private OrdreCommande ordreCommande;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodeItem() { return codeItem; }
    public void setCodeItem(String codeItem) { this.codeItem = codeItem; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public TypeItem getType() { return type; }
    public void setType(TypeItem type) { this.type = type; }

    public Double getPrix() { return prix; }
    public void setPrix(Double prix) { this.prix = prix; }

    public OrdreCommande getOrdreCommande() { return ordreCommande; }
    public void setOrdreCommande(OrdreCommande ordreCommande) { this.ordreCommande = ordreCommande; }
}