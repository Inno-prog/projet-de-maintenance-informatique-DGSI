package com.dgsi.maintenance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "fiches_prestation")
public class FichePrestation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "id_prestation", unique = true)
    private String idPrestation;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @NotBlank
    @Column(name = "nom_item")
    private String nomItem;

    @NotNull
    @Column(name = "date_realisation")
    private LocalDateTime dateRealisation;

    @Enumerated(EnumType.STRING)
    private StatutFiche statut = StatutFiche.EN_ATTENTE;

    @Column(name = "quantite")
    private Integer quantite;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "fichiers_contrat", columnDefinition = "TEXT")
    private String fichiersContrat;

    @PrePersist
    protected void onCreate() {
        if (dateRealisation == null) {
            dateRealisation = LocalDateTime.now();
        }
        if (idPrestation == null || idPrestation.isEmpty()) {
            idPrestation = "FP-" + System.currentTimeMillis();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdPrestation() { return idPrestation; }
    public void setIdPrestation(String idPrestation) { this.idPrestation = idPrestation; }

    public String getNomPrestataire() { return nomPrestataire; }
    public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

    public String getNomItem() { return nomItem; }
    public void setNomItem(String nomItem) { this.nomItem = nomItem; }

    public LocalDateTime getDateRealisation() { return dateRealisation; }
    public void setDateRealisation(LocalDateTime dateRealisation) { this.dateRealisation = dateRealisation; }

    public StatutFiche getStatut() { return statut; }
    public void setStatut(StatutFiche statut) { this.statut = statut; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getFichiersContrat() { return fichiersContrat; }
    public void setFichiersContrat(String fichiersContrat) { this.fichiersContrat = fichiersContrat; }
}