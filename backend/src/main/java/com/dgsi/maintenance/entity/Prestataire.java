package com.dgsi.maintenance.entity;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "prestataires")
// Avoid serializing the 'contrats' collection when a Prestataire is serialized
@JsonIgnoreProperties({"contrats", "hibernateLazyInitializer", "handler"})
public class Prestataire extends User {
    
    @Column(name = "document_contrats", length = 500)
    private String documentContrats;

    @Column(name = "score_historique")
    private Integer scoreHistorique = 0;

    @Column(name = "documents_eval_prest", length = 1000)
    private String documentsEvalPrest;

    @OneToMany(mappedBy = "prestataire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Contrat> contrats = new ArrayList<>();

    public Prestataire() {
        super.setRole("PRESTATAIRE");
    }

    // Getters and Setters
    public String getDocumentContrats() { return documentContrats; }
    public void setDocumentContrats(String documentContrats) { this.documentContrats = documentContrats; }

    public Integer getScoreHistorique() { return scoreHistorique; }
    public void setScoreHistorique(Integer scoreHistorique) { this.scoreHistorique = scoreHistorique; }

    public String getDocumentsEvalPrest() { return documentsEvalPrest; }
    public void setDocumentsEvalPrest(String documentsEvalPrest) { this.documentsEvalPrest = documentsEvalPrest; }

    public List<Contrat> getContrats() { return contrats; }
    public void setContrats(List<Contrat> contrats) { this.contrats = contrats; }
}