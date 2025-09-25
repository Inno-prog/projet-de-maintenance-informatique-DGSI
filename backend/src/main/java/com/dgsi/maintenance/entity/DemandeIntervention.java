package com.dgsi.maintenance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_intervention")
public class DemandeIntervention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "id_demande", unique = true)
    private String idDemande;

    @NotNull
    @Column(name = "date_demande")
    private LocalDateTime dateDemande;

    @NotBlank
    @Column(name = "prestataire_nom")
    private String prestataireNom;

    @NotBlank
    @Column(name = "prestataire_contact")
    private String prestataireContact;

    @NotBlank
    @Column(name = "objet")
    private String objet;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Column(name = "categorie")
    private String categorie;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.SOUMISE;

    @Column(name = "technicien_assigne")
    private String technicienAssigne;

    @Column(name = "fichiers_contrat", columnDefinition = "TEXT")
    private String fichiersContrat;

    @PrePersist
    protected void onCreate() {
        if (dateDemande == null) {
            dateDemande = LocalDateTime.now();
        }
        if (idDemande == null || idDemande.isEmpty()) {
            idDemande = "DI-" + System.currentTimeMillis();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdDemande() { return idDemande; }
    public void setIdDemande(String idDemande) { this.idDemande = idDemande; }

    public LocalDateTime getDateDemande() { return dateDemande; }
    public void setDateDemande(LocalDateTime dateDemande) { this.dateDemande = dateDemande; }

    public String getPrestataireNom() { return prestataireNom; }
    public void setPrestataireNom(String prestataireNom) { this.prestataireNom = prestataireNom; }

    public String getPrestataireContact() { return prestataireContact; }
    public void setPrestataireContact(String prestataireContact) { this.prestataireContact = prestataireContact; }

    public String getObjet() { return objet; }
    public void setObjet(String objet) { this.objet = objet; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public StatutDemande getStatut() { return statut; }
    public void setStatut(StatutDemande statut) { this.statut = statut; }

    public String getTechnicienAssigne() { return technicienAssigne; }
    public void setTechnicienAssigne(String technicienAssigne) { this.technicienAssigne = technicienAssigne; }

    public String getFichiersContrat() { return fichiersContrat; }
    public void setFichiersContrat(String fichiersContrat) { this.fichiersContrat = fichiersContrat; }
}