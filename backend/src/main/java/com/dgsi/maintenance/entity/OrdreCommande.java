package com.dgsi.maintenance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordres_commande")
public class OrdreCommande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "numero_commande", unique = true)
    private String numeroCommande;
    
    @Column(name = "id_oc")
    private String idOC;
    
    @Column(name = "nom_item")
    private String nomItem;
    
    @Column(name = "min_articles")
    private Integer minArticles;
    
    @Column(name = "max_articles")
    private Integer maxArticles;
    
    @Column(name = "nombre_articles_utilise")
    private Integer nombreArticlesUtilise;
    
    @Column(name = "ecart_articles")
    private Integer ecartArticles;
    
    @Column(name = "trimestre")
    private String trimestre;
    
    @Column(name = "prestataire_item")
    private String prestataireItem;
    
    @Column(name = "montant")
    private Double montant;

    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;

    @OneToMany(mappedBy = "ordreCommande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Item> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (idOC == null || idOC.isEmpty()) {
            idOC = "OC-" + System.currentTimeMillis();
        }
        calculateEcart();
    }
    
    @PreUpdate
    protected void onUpdate() {
        calculateEcart();
    }
    
    private void calculateEcart() {
        if (maxArticles != null && nombreArticlesUtilise != null) {
            ecartArticles = maxArticles - nombreArticlesUtilise;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroCommande() { return numeroCommande; }
    public void setNumeroCommande(String numeroCommande) { this.numeroCommande = numeroCommande; }
    
    public String getIdOC() { return idOC; }
    public void setIdOC(String idOC) { this.idOC = idOC; }
    
    public String getNomItem() { return nomItem; }
    public void setNomItem(String nomItem) { this.nomItem = nomItem; }
    
    public Integer getMinArticles() { return minArticles; }
    public void setMinArticles(Integer minArticles) { this.minArticles = minArticles; }
    
    public Integer getMaxArticles() { return maxArticles; }
    public void setMaxArticles(Integer maxArticles) { this.maxArticles = maxArticles; }
    
    public Integer getNombreArticlesUtilise() { return nombreArticlesUtilise; }
    public void setNombreArticlesUtilise(Integer nombreArticlesUtilise) { this.nombreArticlesUtilise = nombreArticlesUtilise; }
    
    public Integer getEcartArticles() { return ecartArticles; }
    public void setEcartArticles(Integer ecartArticles) { this.ecartArticles = ecartArticles; }
    
    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }
    
    public String getPrestataireItem() { return prestataireItem; }
    public void setPrestataireItem(String prestataireItem) { this.prestataireItem = prestataireItem; }
    
    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public StatutCommande getStatut() { return statut; }
    public void setStatut(StatutCommande statut) { this.statut = statut; }

    public Contrat getContrat() { return contrat; }
    public void setContrat(Contrat contrat) { this.contrat = contrat; }

    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }
    
    @Override
    public String toString() {
        return "OrdreCommande{" +
                "id=" + id +
                ", numeroCommande='" + numeroCommande + '\'' +
                ", idOC='" + idOC + '\'' +
                ", nomItem='" + nomItem + '\'' +
                ", minArticles=" + minArticles +
                ", maxArticles=" + maxArticles +
                ", nombreArticlesUtilise=" + nombreArticlesUtilise +
                ", ecartArticles=" + ecartArticles +
                ", trimestre='" + trimestre + '\'' +
                ", prestataireItem='" + prestataireItem + '\'' +
                ", montant=" + montant +
                ", statut=" + statut +
                '}';
    }
}