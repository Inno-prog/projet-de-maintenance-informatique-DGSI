package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class EvaluationTrimestrielleController {

    @Autowired
    private EvaluationService evaluationService;

    @GetMapping
    public List<EvaluationTrimestrielle> getAllEvaluations() {
        return evaluationService.getAllEvaluations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationTrimestrielle> getEvaluationById(@PathVariable Long id) {
        Optional<EvaluationTrimestrielle> evaluation = evaluationService.getEvaluationById(id);
        return evaluation.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public EvaluationTrimestrielle createEvaluation(@RequestBody EvaluationTrimestrielle evaluation) {
        System.out.println("Creating evaluation: " + evaluation.getLot() + ", " + evaluation.getPrestataireNom());
        return evaluationService.saveEvaluation(evaluation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationTrimestrielle> updateEvaluation(@PathVariable Long id, @RequestBody EvaluationTrimestrielle evaluationDetails) {
        Optional<EvaluationTrimestrielle> optionalEvaluation = evaluationService.getEvaluationById(id);
        
        if (optionalEvaluation.isPresent()) {
            EvaluationTrimestrielle evaluation = optionalEvaluation.get();
            
            if (evaluationDetails.getSessionId() != null) evaluation.setSessionId(evaluationDetails.getSessionId());
            if (evaluationDetails.getLot() != null) evaluation.setLot(evaluationDetails.getLot());
            if (evaluationDetails.getPrestataireNom() != null) evaluation.setPrestataireNom(evaluationDetails.getPrestataireNom());
            if (evaluationDetails.getDateEvaluation() != null) evaluation.setDateEvaluation(evaluationDetails.getDateEvaluation());
            if (evaluationDetails.getEvaluateurNom() != null) evaluation.setEvaluateurNom(evaluationDetails.getEvaluateurNom());
            if (evaluationDetails.getCorrespondantId() != null) evaluation.setCorrespondantId(evaluationDetails.getCorrespondantId());
            evaluation.setTechniciensListe(evaluationDetails.getTechniciensListe());
            evaluation.setRapportInterventionTransmis(evaluationDetails.getRapportInterventionTransmis());
            evaluation.setRegistreRempli(evaluationDetails.getRegistreRempli());
            evaluation.setHorairesRespectes(evaluationDetails.getHorairesRespectes());
            evaluation.setDelaiReactionRespecte(evaluationDetails.getDelaiReactionRespecte());
            evaluation.setDelaiInterventionRespecte(evaluationDetails.getDelaiInterventionRespecte());
            evaluation.setVehiculeDisponible(evaluationDetails.getVehiculeDisponible());
            evaluation.setTenueDisponible(evaluationDetails.getTenueDisponible());
            evaluation.setPrestationsVerifiees(evaluationDetails.getPrestationsVerifiees());
            evaluation.setInstancesNonResolues(evaluationDetails.getInstancesNonResolues());
            evaluation.setObservationsGenerales(evaluationDetails.getObservationsGenerales());
            evaluation.setAppreciationRepresentant(evaluationDetails.getAppreciationRepresentant());
            evaluation.setSignatureRepresentant(evaluationDetails.getSignatureRepresentant());
            evaluation.setSignatureEvaluateur(evaluationDetails.getSignatureEvaluateur());
            evaluation.setPreuves(evaluationDetails.getPreuves());
            if (evaluationDetails.getStatut() != null) evaluation.setStatut(evaluationDetails.getStatut());
            if (evaluationDetails.getPenalitesCalcul() != null) evaluation.setPenalitesCalcul(evaluationDetails.getPenalitesCalcul());
            
            return ResponseEntity.ok(evaluationService.saveEvaluation(evaluation));
        }
        
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id) {
        return evaluationService.getEvaluationById(id)
                .map(evaluation -> {
                    evaluationService.deleteEvaluation(id);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataire/{prestataireId}")
    public List<EvaluationTrimestrielle> getEvaluationsByPrestataire(@PathVariable Long prestataireId) {
        return evaluationService.getEvaluationsByPrestataire(prestataireId);
    }

    @GetMapping("/statut/{statut}")
    public List<EvaluationTrimestrielle> getEvaluationsByStatut(@PathVariable String statut) {
        return evaluationService.getEvaluationsByStatut(statut);
    }
}