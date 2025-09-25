package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationTrimestrielleRepository extends JpaRepository<EvaluationTrimestrielle, Long> {
    List<EvaluationTrimestrielle> findByPrestataireNom(String prestataireNom);
    List<EvaluationTrimestrielle> findByEvaluateurNom(String evaluateurNom);
    List<EvaluationTrimestrielle> findByStatut(String statut);
    List<EvaluationTrimestrielle> findByTrimestre(String trimestre);
}