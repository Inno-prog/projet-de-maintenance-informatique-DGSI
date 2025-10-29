package com.dgsi.maintenance.controller;

import java.time.LocalDate;
import java.util.List;
import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.TypeItem;
import com.dgsi.maintenance.repository.EvaluationTrimestrielleRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.repository.TypeItemRepository;
import com.dgsi.maintenance.service.PDFGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PDFController {

    @Autowired
    private PDFGenerationService pdfGenerationService;

    @Autowired
    private EvaluationTrimestrielleRepository evaluationRepository;

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    @Autowired
    private TypeItemRepository typeItemRepository;

    @GetMapping("/ordre-commande")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<byte[]> genererOrdreCommande() {
        try {
            // Récupérer tous les items avec OC1 > 0
            List<TypeItem> items = typeItemRepository.findAll().stream()
                    .filter(item -> item.getOc1Quantity() != null && item.getOc1Quantity() > 0)
                    .toList();

            if (items.isEmpty()) {
                return ResponseEntity.badRequest().body("Aucun item avec quantité OC1 trouvée".getBytes());
            }

            // Générer le trimestre actuel
            int mois = LocalDate.now().getMonthValue();
            String trimestre = "T" + ((mois - 1) / 3 + 1) + "-" + LocalDate.now().getYear();

            // Générer le PDF
            byte[] pdfContent = pdfGenerationService.genererOrdreCommandeFromItems(items, trimestre);

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().body("Erreur lors de la génération du PDF".getBytes());
            }

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ordre-commande-" + trimestre + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
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

    @GetMapping("/rapport-trimestriel")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<byte[]> genererRapportTrimestriel() {
        try {
            // Générer le trimestre actuel
            int mois = LocalDate.now().getMonthValue();
            String trimestre = "T" + ((mois - 1) / 3 + 1) + "-" + LocalDate.now().getYear();

            // Récupérer toutes les évaluations du trimestre
            List<EvaluationTrimestrielle> evaluations = evaluationRepository.findByTrimestre(trimestre);

            // Générer le PDF du rapport trimestriel
            byte[] pdfContent = pdfGenerationService.genererRapportTrimestriel(evaluations, trimestre);

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().body("Erreur lors de la génération du rapport trimestriel".getBytes());
            }

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "rapport-trimestriel-" + trimestre + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/rapport-annuel")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<byte[]> genererRapportAnnuel() {
        try {
            int annee = LocalDate.now().getYear();

            // Récupérer toutes les évaluations de l'année
            List<EvaluationTrimestrielle> evaluations = evaluationRepository.findAll().stream()
                    .filter(e -> e.getDateEvaluation() != null && e.getDateEvaluation().getYear() == annee)
                    .toList();

            // Générer le PDF du rapport annuel
            byte[] pdfContent = pdfGenerationService.genererRapportAnnuel(evaluations, annee);

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().body("Erreur lors de la génération du rapport annuel".getBytes());
            }

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "rapport-annuel-" + annee + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ordre-commande/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<byte[]> genererOrdreCommandeDetail(@PathVariable Long id) {
        try {
            // Récupérer l'ordre de commande
            OrdreCommande ordre = ordreCommandeRepository.findByIdWithPrestations(id).orElse(null);

            if (ordre == null) {
                return ResponseEntity.notFound().build();
            }

            // Générer le PDF
            byte[] pdfContent = pdfGenerationService.genererOrdreCommandeDetail(ordre);

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().body("Erreur lors de la génération du PDF".getBytes());
            }

            // Préparer la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String fileName = "ordre-commande-" + (ordre.getNumeroOc() != null ? ordre.getNumeroOc() : ordre.getIdOC()) + ".pdf";
            headers.setContentDispositionFormData("attachment", fileName);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}