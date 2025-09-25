package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutFiche;
import com.dgsi.maintenance.repository.EvaluationTrimestrielleRepository;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.service.PDFGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PDFController {

    @Autowired
    private PDFGenerationService pdfGenerationService;

    @Autowired
    private FichePrestationRepository ficheRepository;

    @Autowired
    private EvaluationTrimestrielleRepository evaluationRepository;

    @GetMapping("/ordre-commande")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<byte[]> genererOrdreCommande() {
        try {
            // Récupérer les prestations validées
            List<FichePrestation> prestationsTerminees = ficheRepository.findByStatut(StatutFiche.VALIDER);
            
            if (prestationsTerminees.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            // Générer le trimestre actuel
            int mois = LocalDate.now().getMonthValue();
            String trimestre = "T" + ((mois - 1) / 3 + 1) + "-" + LocalDate.now().getYear();

            // Générer le PDF
            byte[] pdfContent = pdfGenerationService.genererOrdreCommande(prestationsTerminees, trimestre);

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "ordre-commande-" + trimestre + ".txt");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/evaluation/{id}")
    public ResponseEntity<byte[]> genererEvaluation(@PathVariable Long id) {
        try {
            // Récupérer l'évaluation
            EvaluationTrimestrielle evaluation = evaluationRepository.findById(id).orElse(null);

            if (evaluation == null) {
                return ResponseEntity.notFound().build();
            }

            // Générer le PDF
            byte[] pdfContent = pdfGenerationService.genererEvaluationTrimestrielle(evaluation);

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                "evaluation-" + evaluation.getPrestataireNom().replaceAll("[^a-zA-Z0-9]", "-") + "-" + evaluation.getTrimestre() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}