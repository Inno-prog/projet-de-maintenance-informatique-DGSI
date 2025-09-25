package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.repository.EvaluationTrimestrielleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationTrimestrielleRepository evaluationRepository;

    public List<EvaluationTrimestrielle> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Optional<EvaluationTrimestrielle> getEvaluationById(Long id) {
        return evaluationRepository.findById(id);
    }

    public EvaluationTrimestrielle saveEvaluation(EvaluationTrimestrielle evaluation) {
        // Calculer automatiquement les pénalités et la note finale
        BigDecimal penalties = calculatePenalties(evaluation);
        BigDecimal score = calculateFinalScore(evaluation);
        
        System.out.println("Calcul - Pénalités: " + penalties + ", Note: " + score);
        
        evaluation.setPenalitesCalcul(penalties);
        evaluation.setNoteFinale(score);
        evaluation.setPrestataireDeclasse(score.compareTo(new BigDecimal("25")) < 0);
        
        return evaluationRepository.save(evaluation);
    }

    public void deleteEvaluation(Long id) {
        evaluationRepository.deleteById(id);
    }

    public List<EvaluationTrimestrielle> getEvaluationsByPrestataire(Long prestataireId) {
        // Cette méthode n'est plus utilisée car on utilise maintenant les noms
        return evaluationRepository.findAll();
    }
    
    public List<EvaluationTrimestrielle> getEvaluationsByPrestataireNom(String prestataireNom) {
        return evaluationRepository.findByPrestataireNom(prestataireNom);
    }

    public List<EvaluationTrimestrielle> getEvaluationsByStatut(String statut) {
        return evaluationRepository.findByStatut(statut);
    }

    private BigDecimal calculatePenalties(EvaluationTrimestrielle evaluation) {
        BigDecimal penalties = BigDecimal.ZERO;
        
        // Logique de calcul des pénalités basée sur les critères non respectés
        if (Boolean.FALSE.equals(evaluation.getRapportInterventionTransmis())) {
            penalties = penalties.add(new BigDecimal("50"));
        }
        if (Boolean.FALSE.equals(evaluation.getDelaiReactionRespecte())) {
            penalties = penalties.add(new BigDecimal("100"));
        }
        if (Boolean.FALSE.equals(evaluation.getDelaiInterventionRespecte())) {
            penalties = penalties.add(new BigDecimal("150"));
        }
        if (Boolean.FALSE.equals(evaluation.getHorairesRespectes())) {
            penalties = penalties.add(new BigDecimal("75"));
        }
        
        return penalties;
    }
    
    private BigDecimal calculateFinalScore(EvaluationTrimestrielle evaluation) {
        int totalCriteria = 7; // Nombre total de critères à évaluer
        int positivePoints = 0;
        
        // Compter les critères respectés (true = +1 point)
        if (Boolean.TRUE.equals(evaluation.getRapportInterventionTransmis())) positivePoints++;
        if (Boolean.TRUE.equals(evaluation.getRegistreRempli())) positivePoints++;
        if (Boolean.TRUE.equals(evaluation.getHorairesRespectes())) positivePoints++;
        if (Boolean.TRUE.equals(evaluation.getDelaiReactionRespecte())) positivePoints++;
        if (Boolean.TRUE.equals(evaluation.getDelaiInterventionRespecte())) positivePoints++;
        if (Boolean.TRUE.equals(evaluation.getVehiculeDisponible())) positivePoints++;
        if (Boolean.TRUE.equals(evaluation.getTenueDisponible())) positivePoints++;
        
        // Calculer le pourcentage (note sur 100)
        return new BigDecimal(positivePoints * 100 / totalCriteria);
    }
}