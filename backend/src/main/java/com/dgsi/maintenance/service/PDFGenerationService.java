package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.FichePrestation;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PDFGenerationService {

    public byte[] genererOrdreCommande(List<FichePrestation> prestations, String trimestre) {
        StringBuilder content = new StringBuilder();
        
        // En-tête
        content.append("ORDRE DE COMMANDE TRIMESTRIEL\n");
        content.append("=".repeat(50)).append("\n\n");
        
        // Informations générales
        content.append("Trimestre: ").append(trimestre).append("\n");
        content.append("Date de génération: ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n");
        content.append("Nombre de prestations: ").append(prestations.size()).append("\n\n");
        
        // Tableau des prestations
        content.append("DÉTAIL DES PRESTATIONS\n");
        content.append("-".repeat(80)).append("\n");
        content.append(String.format("%-15s %-20s %-20s %-10s %-15s\n", 
            "ID", "Prestataire", "Item", "Quantité", "Date"));
        content.append("-".repeat(80)).append("\n");
        
        for (FichePrestation prestation : prestations) {
            content.append(String.format("%-15s %-20s %-20s %-10d %-15s\n",
                prestation.getIdPrestation(),
                prestation.getNomPrestataire().length() > 20 ? 
                    prestation.getNomPrestataire().substring(0, 17) + "..." : prestation.getNomPrestataire(),
                prestation.getNomItem().length() > 20 ? 
                    prestation.getNomItem().substring(0, 17) + "..." : prestation.getNomItem(),
                prestation.getQuantite(),
                prestation.getDateRealisation()
            ));
        }
        
        // Résumé
        content.append("\n").append("=".repeat(50)).append("\n");
        content.append("RÉSUMÉ\n");
        content.append("Total prestations terminées: ").append(prestations.size()).append("\n");
        
        long totalQuantite = prestations.stream().mapToLong(FichePrestation::getQuantite).sum();
        content.append("Quantité totale: ").append(totalQuantite).append("\n");
        
        content.append("\nDocument généré le ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n");
        
        return content.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] genererEvaluationTrimestrielle(EvaluationTrimestrielle evaluation) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fonts
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.BLACK);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.BLACK);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLUE);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
        Font tableHeaderFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
        Font smallFont = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.GRAY);

        // Title
        Paragraph title = new Paragraph("RAPPORT DU " + getTrimestreText(evaluation.getTrimestre()) + " DE LA MAINTENANCE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Header information
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 2});

        addCellToTable(headerTable, "Lot :", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(headerTable, evaluation.getLot(), normalFont, BaseColor.WHITE);

        addCellToTable(headerTable, "Période :", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(headerTable, getPeriodeText(evaluation.getTrimestre()), normalFont, BaseColor.WHITE);

        addCellToTable(headerTable, "Prestataire :", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(headerTable, evaluation.getPrestataireNom(), normalFont, BaseColor.WHITE);

        addCellToTable(headerTable, "Date évaluation :", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(headerTable, evaluation.getDateEvaluation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont, BaseColor.WHITE);

        headerTable.setSpacingAfter(20);
        document.add(headerTable);

        // I. INTRODUCTION
        Paragraph introTitle = new Paragraph("I. INTRODUCTION", sectionFont);
        introTitle.setSpacingAfter(10);
        document.add(introTitle);

        Paragraph introText = new Paragraph(
            "Le Ministère de l'Économie et des Finances (MEF) signe annuellement des contrats " +
            "de maintenance informatique avec des prestataires privés. " +
            "Une évaluation trimestrielle est réalisée pour vérifier si les prestations attendues " +
            "sont respectées conformément aux contrats.", normalFont);
        introText.setSpacingAfter(20);
        document.add(introText);

        // II. ALLOTISSEMENT
        Paragraph allotTitle = new Paragraph("II. ALLOTISSEMENT", sectionFont);
        allotTitle.setSpacingAfter(10);
        document.add(allotTitle);

        Paragraph allotText = new Paragraph(
            "Lot " + evaluation.getLot().replace("Lot ", "") + " : Maintenance du matériel informatique et support bureautique " +
            "des bâtiments R+5, R+4, R+1 du MEF.\n" +
            "Direction concernée : BCMP", normalFont);
        allotText.setSpacingAfter(20);
        document.add(allotText);

        // III. EXIGENCES À SATISFAIRE
        Paragraph exigencesTitle = new Paragraph("III. EXIGENCES À SATISFAIRE", sectionFont);
        exigencesTitle.setSpacingAfter(10);
        document.add(exigencesTitle);

        // Create requirements table
        PdfPTable exigencesTable = new PdfPTable(4);
        exigencesTable.setWidthPercentage(100);
        exigencesTable.setWidths(new float[]{0.5f, 3f, 1.5f, 2f});

        // Table headers
        addCellToTable(exigencesTable, "N°", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(exigencesTable, "Exigences du DAO", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(exigencesTable, "Prestataire", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(exigencesTable, "Observations", tableHeaderFont, BaseColor.BLUE);

        // Add criteria rows
        String[][] criteres = {
            {"1", "Vérification des techniciens avec chef de site certifié ITIL Foundation",
             evaluation.getTechniciensCertifies() != null && evaluation.getTechniciensCertifies() ? "Liste effective fournie" : "Non fournie",
             evaluation.getObsTechniciens() != null ? evaluation.getObsTechniciens() : (evaluation.getTechniciensCertifies() != null && evaluation.getTechniciensCertifies() ? "RAS" : "À fournir")},

            {"2", "Transmission du rapport d'intervention trimestriel",
             evaluation.getRapportInterventionTransmis() != null && evaluation.getRapportInterventionTransmis() ? "Transmis" : "Non transmis",
             evaluation.getObsRapport() != null ? evaluation.getObsRapport() : (evaluation.getRapportInterventionTransmis() != null && evaluation.getRapportInterventionTransmis() ? "RAS" : "A transmettre au plus tard le " + getDeadlineDate(evaluation.getTrimestre()))},

            {"3", "Remplissage quotidien du registre et fiches d'interventions",
             evaluation.getRegistreRempli() != null && evaluation.getRegistreRempli() ? "Effectué" : "Non effectué",
             evaluation.getObsRegistre() != null ? evaluation.getObsRegistre() : (evaluation.getRegistreRempli() != null && evaluation.getRegistreRempli() ? "RAS" : "À régulariser")},

            {"4", "Respect des horaires d'intervention",
             evaluation.getHorairesRespectes() != null && evaluation.getHorairesRespectes() ? "Respectés" : "Non respectés",
             evaluation.getObsHoraires() != null ? evaluation.getObsHoraires() : (evaluation.getHorairesRespectes() != null && evaluation.getHorairesRespectes() ? "RAS" : "Amélioration requise")},

            {"5", "Respect du délai de réaction (4h)",
             evaluation.getDelaiReactionRespecte() != null && evaluation.getDelaiReactionRespecte() ? "Respecté" : "Non respecté",
             evaluation.getObsDelaiReaction() != null ? evaluation.getObsDelaiReaction() : (evaluation.getDelaiReactionRespecte() != null && evaluation.getDelaiReactionRespecte() ? "RAS" : "Délais dépassés constatés")},

            {"6", "Respect du délai d'intervention (24h)",
             evaluation.getDelaiInterventionRespecte() != null && evaluation.getDelaiInterventionRespecte() ? "Respecté" : "Non respecté",
             evaluation.getObsDelaiIntervention() != null ? evaluation.getObsDelaiIntervention() : (evaluation.getDelaiInterventionRespecte() != null && evaluation.getDelaiInterventionRespecte() ? "RAS" : "Interventions tardives")},

            {"7", "Disponibilité du véhicule de service",
             evaluation.getVehiculeDisponible() != null && evaluation.getVehiculeDisponible() ? "Disponible" : "Non disponible",
             evaluation.getObsVehicule() != null ? evaluation.getObsVehicule() : (evaluation.getVehiculeDisponible() != null && evaluation.getVehiculeDisponible() ? "RAS" : "Véhicule indisponible")},

            {"8", "Disponibilité de la tenue réglementaire",
             evaluation.getTenueDisponible() != null && evaluation.getTenueDisponible() ? "Disponible" : "Non disponible",
             evaluation.getObsTenue() != null ? evaluation.getObsTenue() : (evaluation.getTenueDisponible() != null && evaluation.getTenueDisponible() ? "RAS" : "Tenue manquante")}
        };

        for (int i = 0; i < criteres.length; i++) {
            String[] critere = criteres[i];
            BaseColor rowColor = i % 2 == 0 ? BaseColor.WHITE : new BaseColor(245, 245, 245);
            addCellToTable(exigencesTable, critere[0], normalFont, rowColor);
            addCellToTable(exigencesTable, critere[1], normalFont, rowColor);
            addCellToTable(exigencesTable, critere[2], normalFont, rowColor);
            addCellToTable(exigencesTable, critere[3], normalFont, rowColor);
        }

        exigencesTable.setSpacingAfter(20);
        document.add(exigencesTable);

        // IV. INSTANCES NON RÉSOLUES
        Paragraph instancesTitle = new Paragraph("IV. INSTANCES NON RÉSOLUES", sectionFont);
        instancesTitle.setSpacingAfter(10);
        document.add(instancesTitle);

        PdfPTable instancesTable = new PdfPTable(4);
        instancesTable.setWidthPercentage(100);
        instancesTable.setWidths(new float[]{0.5f, 2f, 1.5f, 1f});

        addCellToTable(instancesTable, "N°", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(instancesTable, "Instance", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(instancesTable, "Direction", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(instancesTable, "Date début", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(instancesTable, "Jours pénalité", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(instancesTable, "Observation", tableHeaderFont, BaseColor.BLUE);

        if (evaluation.getInstancesNonResolues() != null && !evaluation.getInstancesNonResolues().trim().isEmpty()) {
            addCellToTable(instancesTable, "1", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, evaluation.getInstancesNonResolues(), normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "BCMP", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, evaluation.getDateEvaluation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, evaluation.getPenalitesCalcul() != null ? evaluation.getPenalitesCalcul().toString() : "0", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "Instance en cours de résolution", normalFont, BaseColor.WHITE);
        } else {
            addCellToTable(instancesTable, "1", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "RAS", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "-", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "-", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "-", normalFont, BaseColor.WHITE);
            addCellToTable(instancesTable, "-", normalFont, BaseColor.WHITE);
        }

        instancesTable.setSpacingAfter(20);
        document.add(instancesTable);

        // V. APPRÉCIATIONS
        Paragraph appreciationsTitle = new Paragraph("V. APPRÉCIATIONS", sectionFont);
        appreciationsTitle.setSpacingAfter(10);
        document.add(appreciationsTitle);

        if (evaluation.getObservationsGenerales() != null && !evaluation.getObservationsGenerales().trim().isEmpty()) {
            Paragraph obsTitle = new Paragraph("Observations générales :", headerFont);
            document.add(obsTitle);
            Paragraph obsText = new Paragraph(evaluation.getObservationsGenerales(), normalFont);
            obsText.setSpacingAfter(10);
            document.add(obsText);
        }

        if (evaluation.getAppreciationRepresentant() != null && !evaluation.getAppreciationRepresentant().trim().isEmpty()) {
            Paragraph appTitle = new Paragraph("Appréciation du représentant :", headerFont);
            document.add(appTitle);
            Paragraph appText = new Paragraph(evaluation.getAppreciationRepresentant(), normalFont);
            appText.setSpacingAfter(10);
            document.add(appText);
        }

        // Score and recommendation
        int score = calculerScore(evaluation);
        Paragraph scoreText = new Paragraph("Note finale : " + score + "/8", headerFont);
        document.add(scoreText);

        Paragraph recoText = new Paragraph("Recommandation : " + getRecommandationText(score), headerFont);
        recoText.setSpacingAfter(20);
        document.add(recoText);

        // Signatures
        Paragraph signaturesTitle = new Paragraph("Signatures :", headerFont);
        document.add(signaturesTitle);

        PdfPTable signaturesTable = new PdfPTable(1);
        signaturesTable.setWidthPercentage(60);
        signaturesTable.setHorizontalAlignment(Element.ALIGN_LEFT);

        addCellToTable(signaturesTable, "DGSI : " + (evaluation.getEvaluateurNom() != null ? evaluation.getEvaluateurNom() : "Non spécifié"), normalFont, BaseColor.WHITE);
        addCellToTable(signaturesTable, "Correspondant Informatique : " + (evaluation.getCorrespondantId() != null ? "Correspondant " + evaluation.getCorrespondantId() : "Non spécifié"), normalFont, BaseColor.WHITE);
        addCellToTable(signaturesTable, "Prestataire : " + evaluation.getPrestataireNom(), normalFont, BaseColor.WHITE);

        signaturesTable.setSpacingAfter(20);
        document.add(signaturesTable);

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), smallFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    private void addCellToTable(PdfPTable table, String text, Font font, BaseColor backgroundColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(5);
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    private String getTrimestreText(String trimestre) {
        if (trimestre == null) return "TRIMESTRE";
        return switch (trimestre) {
            case "T1" -> "PREMIER TRIMESTRE";
            case "T2" -> "DEUXIÈME TRIMESTRE";
            case "T3" -> "TROISIÈME TRIMESTRE";
            case "T4" -> "QUATRIÈME TRIMESTRE";
            default -> trimestre;
        };
    }

    private String getPeriodeText(String trimestre) {
        if (trimestre == null) return "";
        return switch (trimestre) {
            case "T1" -> "01 Janvier – 31 Mars";
            case "T2" -> "01 Avril – 30 Juin";
            case "T3" -> "01 Juillet – 30 Septembre";
            case "T4" -> "01 Octobre – 31 Décembre";
            default -> trimestre;
        };
    }

    private String getDeadlineDate(String trimestre) {
        if (trimestre == null) return "Date à définir";
        return switch (trimestre) {
            case "T1" -> "1er Avril " + LocalDate.now().getYear();
            case "T2" -> "1er Juillet " + LocalDate.now().getYear();
            case "T3" -> "1er Octobre " + LocalDate.now().getYear();
            case "T4" -> "1er Janvier " + (LocalDate.now().getYear() + 1);
            default -> "Date à définir";
        };
    }

    private int calculerScore(EvaluationTrimestrielle evaluation) {
        int score = 0;
        if (Boolean.TRUE.equals(evaluation.getTechniciensCertifies())) score++;
        if (Boolean.TRUE.equals(evaluation.getRapportInterventionTransmis())) score++;
        if (Boolean.TRUE.equals(evaluation.getRegistreRempli())) score++;
        if (Boolean.TRUE.equals(evaluation.getHorairesRespectes())) score++;
        if (Boolean.TRUE.equals(evaluation.getDelaiReactionRespecte())) score++;
        if (Boolean.TRUE.equals(evaluation.getDelaiInterventionRespecte())) score++;
        if (Boolean.TRUE.equals(evaluation.getVehiculeDisponible())) score++;
        if (Boolean.TRUE.equals(evaluation.getTenueDisponible())) score++;
        return score;
    }

    private String getRecommandationText(int score) {
        if (score >= 7) return "MAINTENIR LE PRESTATAIRE";
        if (score >= 5) return "FORMATION REQUISE";
        return "DÉCLASSER LE PRESTATAIRE";
    }
}