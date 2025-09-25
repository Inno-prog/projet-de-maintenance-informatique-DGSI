package com.dgsi.maintenance.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_trimestrielle")
public class EvaluationTrimestrielle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id")
    private Long sessionId;
    
    @Column(name = "trimestre", length = 50)
    private String trimestre;
    
    @Column(name = "lot", length = 50)
    private String lot;
    
    @Column(name = "prestataire_nom", length = 200)
    private String prestataireNom;
    
    @Column(name = "date_evaluation")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEvaluation;
    
    @Column(name = "evaluateur_nom", length = 200)
    private String evaluateurNom;
    
    @Column(name = "correspondant_id")
    private Long correspondantId;
    
    @Column(name = "techniciens_liste", columnDefinition = "JSON")
    private String techniciensListe;

    @Column(name = "techniciens_certifies")
    private Boolean techniciensCertifies;

    @Column(name = "rapport_intervention_transmis")
    private Boolean rapportInterventionTransmis;
    
    @Column(name = "registre_rempli")
    private Boolean registreRempli;
    
    @Column(name = "horaires_respectes")
    private Boolean horairesRespectes;
    
    @Column(name = "delai_reaction_respecte")
    private Boolean delaiReactionRespecte;
    
    @Column(name = "delai_intervention_respecte")
    private Boolean delaiInterventionRespecte;
    
    @Column(name = "vehicule_disponible")
    private Boolean vehiculeDisponible;
    
    @Column(name = "tenue_disponible")
    private Boolean tenueDisponible;

    @Column(name = "obs_techniciens", length = 500)
    private String obsTechniciens;

    @Column(name = "obs_rapport", length = 500)
    private String obsRapport;

    @Column(name = "obs_registre", length = 500)
    private String obsRegistre;

    @Column(name = "obs_horaires", length = 500)
    private String obsHoraires;

    @Column(name = "obs_delai_reaction", length = 500)
    private String obsDelaiReaction;

    @Column(name = "obs_delai_intervention", length = 500)
    private String obsDelaiIntervention;

    @Column(name = "obs_vehicule", length = 500)
    private String obsVehicule;

    @Column(name = "obs_tenue", length = 500)
    private String obsTenue;

    @Column(name = "prestations_verifiees", columnDefinition = "JSON")
    private String prestationsVerifiees;
    
    @Column(name = "instances_non_resolues", columnDefinition = "JSON")
    private String instancesNonResolues;
    
    @Column(name = "observations_generales", columnDefinition = "TEXT")
    private String observationsGenerales;
    
    @Column(name = "appreciation_representant", columnDefinition = "TEXT")
    private String appreciationRepresentant;
    
    @Column(name = "signature_representant")
    private String signatureRepresentant;
    
    @Column(name = "signature_evaluateur")
    private String signatureEvaluateur;
    
    @Column(name = "preuves", columnDefinition = "JSON")
    private String preuves;
    
    @Column(name = "statut", length = 50)
    private String statut;
    
    @Column(name = "penalites_calcul", precision = 10, scale = 2)
    private BigDecimal penalitesCalcul;
    
    @Column(name = "note_finale", precision = 5, scale = 2)
    private BigDecimal noteFinale;
    
    @Column(name = "prestataire_declasse")
    private Boolean prestataireDeclasse;
    
    @Column(name = "score_global")
    private Integer scoreGlobal;
    
    @Column(name = "recommandation", length = 50)
    private String recommandation;
    
    @Column(name = "date_creation")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCreation;
    
    @Column(name = "date_modification")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateModification;
    
    @Column(name = "utilisateur_creation")
    private Long utilisateurCreation;
    
    @Column(name = "utilisateur_modification")
    private Long utilisateurModification;
    
    @Column(name = "fichier_pdf")
    private String fichierPdf;

    // Constructors
    public EvaluationTrimestrielle() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

    public String getLot() { return lot; }
    public void setLot(String lot) { this.lot = lot; }

    public String getPrestataireNom() { return prestataireNom; }
    public void setPrestataireNom(String prestataireNom) { this.prestataireNom = prestataireNom; }

    public LocalDate getDateEvaluation() { return dateEvaluation; }
    public void setDateEvaluation(LocalDate dateEvaluation) { this.dateEvaluation = dateEvaluation; }

    public String getEvaluateurNom() { return evaluateurNom; }
    public void setEvaluateurNom(String evaluateurNom) { this.evaluateurNom = evaluateurNom; }

    public Long getCorrespondantId() { return correspondantId; }
    public void setCorrespondantId(Long correspondantId) { this.correspondantId = correspondantId; }

    public String getTechniciensListe() { return techniciensListe; }
    public void setTechniciensListe(String techniciensListe) { this.techniciensListe = techniciensListe; }

    public Boolean getRapportInterventionTransmis() { return rapportInterventionTransmis; }
    public void setRapportInterventionTransmis(Boolean rapportInterventionTransmis) { this.rapportInterventionTransmis = rapportInterventionTransmis; }

    public Boolean getRegistreRempli() { return registreRempli; }
    public void setRegistreRempli(Boolean registreRempli) { this.registreRempli = registreRempli; }

    public Boolean getHorairesRespectes() { return horairesRespectes; }
    public void setHorairesRespectes(Boolean horairesRespectes) { this.horairesRespectes = horairesRespectes; }

    public Boolean getDelaiReactionRespecte() { return delaiReactionRespecte; }
    public void setDelaiReactionRespecte(Boolean delaiReactionRespecte) { this.delaiReactionRespecte = delaiReactionRespecte; }

    public Boolean getDelaiInterventionRespecte() { return delaiInterventionRespecte; }
    public void setDelaiInterventionRespecte(Boolean delaiInterventionRespecte) { this.delaiInterventionRespecte = delaiInterventionRespecte; }

    public Boolean getVehiculeDisponible() { return vehiculeDisponible; }
    public void setVehiculeDisponible(Boolean vehiculeDisponible) { this.vehiculeDisponible = vehiculeDisponible; }

    public Boolean getTenueDisponible() { return tenueDisponible; }
    public void setTenueDisponible(Boolean tenueDisponible) { this.tenueDisponible = tenueDisponible; }

    public Boolean getTechniciensCertifies() { return techniciensCertifies; }
    public void setTechniciensCertifies(Boolean techniciensCertifies) { this.techniciensCertifies = techniciensCertifies; }

    public String getObsTechniciens() { return obsTechniciens; }
    public void setObsTechniciens(String obsTechniciens) { this.obsTechniciens = obsTechniciens; }

    public String getObsRapport() { return obsRapport; }
    public void setObsRapport(String obsRapport) { this.obsRapport = obsRapport; }

    public String getObsRegistre() { return obsRegistre; }
    public void setObsRegistre(String obsRegistre) { this.obsRegistre = obsRegistre; }

    public String getObsHoraires() { return obsHoraires; }
    public void setObsHoraires(String obsHoraires) { this.obsHoraires = obsHoraires; }

    public String getObsDelaiReaction() { return obsDelaiReaction; }
    public void setObsDelaiReaction(String obsDelaiReaction) { this.obsDelaiReaction = obsDelaiReaction; }

    public String getObsDelaiIntervention() { return obsDelaiIntervention; }
    public void setObsDelaiIntervention(String obsDelaiIntervention) { this.obsDelaiIntervention = obsDelaiIntervention; }

    public String getObsVehicule() { return obsVehicule; }
    public void setObsVehicule(String obsVehicule) { this.obsVehicule = obsVehicule; }

    public String getObsTenue() { return obsTenue; }
    public void setObsTenue(String obsTenue) { this.obsTenue = obsTenue; }

    public String getPrestationsVerifiees() { return prestationsVerifiees; }
    public void setPrestationsVerifiees(String prestationsVerifiees) { this.prestationsVerifiees = prestationsVerifiees; }

    public String getInstancesNonResolues() { return instancesNonResolues; }
    public void setInstancesNonResolues(String instancesNonResolues) { this.instancesNonResolues = instancesNonResolues; }

    public String getObservationsGenerales() { return observationsGenerales; }
    public void setObservationsGenerales(String observationsGenerales) { this.observationsGenerales = observationsGenerales; }

    public String getAppreciationRepresentant() { return appreciationRepresentant; }
    public void setAppreciationRepresentant(String appreciationRepresentant) { this.appreciationRepresentant = appreciationRepresentant; }

    public String getSignatureRepresentant() { return signatureRepresentant; }
    public void setSignatureRepresentant(String signatureRepresentant) { this.signatureRepresentant = signatureRepresentant; }

    public String getSignatureEvaluateur() { return signatureEvaluateur; }
    public void setSignatureEvaluateur(String signatureEvaluateur) { this.signatureEvaluateur = signatureEvaluateur; }

    public String getPreuves() { return preuves; }
    public void setPreuves(String preuves) { this.preuves = preuves; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public BigDecimal getPenalitesCalcul() { return penalitesCalcul; }
    public void setPenalitesCalcul(BigDecimal penalitesCalcul) { this.penalitesCalcul = penalitesCalcul; }

    public BigDecimal getNoteFinale() { return noteFinale; }
    public void setNoteFinale(BigDecimal noteFinale) { this.noteFinale = noteFinale; }

    public Boolean getPrestataireDeclasse() { return prestataireDeclasse; }
    public void setPrestataireDeclasse(Boolean prestataireDeclasse) { this.prestataireDeclasse = prestataireDeclasse; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    public Long getUtilisateurCreation() { return utilisateurCreation; }
    public void setUtilisateurCreation(Long utilisateurCreation) { this.utilisateurCreation = utilisateurCreation; }

    public Long getUtilisateurModification() { return utilisateurModification; }
    public void setUtilisateurModification(Long utilisateurModification) { this.utilisateurModification = utilisateurModification; }

    public String getFichierPdf() { return fichierPdf; }
    public void setFichierPdf(String fichierPdf) { this.fichierPdf = fichierPdf; }

    public Integer getScoreGlobal() { return scoreGlobal; }
    public void setScoreGlobal(Integer scoreGlobal) { this.scoreGlobal = scoreGlobal; }

    public String getRecommandation() { return recommandation; }
    public void setRecommandation(String recommandation) { this.recommandation = recommandation; }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}