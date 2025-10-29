package com.dgsi.maintenance.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.entity.TypeItem;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

@Service
public class PDFGenerationService {

    public byte[] genererOrdreCommande(List<OrdreCommande> ordres, String trimestre) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 50, 50, 50, 50); // Landscape for table
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fonts
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.BLACK);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
        Font tableHeaderFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

        // Title
        Paragraph title = new Paragraph("ORDRE DE COMMANDE TRIMESTRIEL", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Trimestre: " + trimestre + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        headerInfo.setSpacingAfter(20);
        document.add(headerInfo);

        // Create order table
        PdfPTable orderTable = new PdfPTable(8);
        orderTable.setWidthPercentage(100);
        orderTable.setWidths(new float[]{0.5f, 3f, 1f, 1f, 1f, 1f, 1.5f, 1f});

        // Table headers
        addCellToTable(orderTable, "N°", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Prestations", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Min", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Max", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "PU", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "OC1", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Montant OC1", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Ecart", tableHeaderFont, BaseColor.BLUE);

        // Add order rows
        int rowNum = 1;
        double totalMontant = 0;
        for (OrdreCommande ordre : ordres) {
            BaseColor rowColor = rowNum % 2 == 0 ? BaseColor.WHITE : new BaseColor(245, 245, 245);
            addCellToTable(orderTable, ordre.getNumeroCommande(), normalFont, rowColor);
            addCellToTable(orderTable, ordre.getNomItem(), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(ordre.getMinArticles()), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(ordre.getMaxArticles()), normalFont, rowColor);
            addCellToTable(orderTable, "-", normalFont, rowColor); // PU not available
            addCellToTable(orderTable, String.valueOf(ordre.getNombreArticlesUtilise()), normalFont, rowColor);
            addCellToTable(orderTable, String.format("%.2f", ordre.getMontant()), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(ordre.getEcartArticles()), normalFont, rowColor);
            totalMontant += ordre.getMontant();
            rowNum++;
        }

        // Summary row
        addCellToTable(orderTable, "TOTAL GENERAL", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, String.format("%.2f", totalMontant), headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);

        orderTable.setSpacingAfter(20);
        document.add(orderTable);

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] genererOrdreCommandeFromItems(List<TypeItem> items, String trimestre) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 50, 50, 50, 50); // Landscape for table
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fonts
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.BLACK);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
        Font tableHeaderFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

        // Title
        Paragraph title = new Paragraph("ORDRE DE COMMANDE TRIMESTRIEL", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Trimestre: " + trimestre + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        headerInfo.setSpacingAfter(20);
        document.add(headerInfo);

        // Create order table
        PdfPTable orderTable = new PdfPTable(8);
        orderTable.setWidthPercentage(100);
        orderTable.setWidths(new float[]{0.5f, 3f, 1f, 1f, 1f, 1f, 1.5f, 1f});

        // Table headers
        addCellToTable(orderTable, "N°", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Prestations", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Min", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Max", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "PU", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "OC1", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Montant OC1", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(orderTable, "Ecart", tableHeaderFont, BaseColor.BLUE);

        // Add order rows
        int rowNum = 1;
        double totalMontant = 0;
        for (TypeItem item : items) {
            BaseColor rowColor = rowNum % 2 == 0 ? BaseColor.WHITE : new BaseColor(245, 245, 245);
            addCellToTable(orderTable, item.getNumero(), normalFont, rowColor);
            addCellToTable(orderTable, item.getPrestation(), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(item.getMinArticles()), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(item.getMaxArticles()), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(item.getPrixUnitaire()), normalFont, rowColor);
            addCellToTable(orderTable, String.valueOf(item.getOc1Quantity()), normalFont, rowColor);
            double montant = item.getPrixUnitaire() * item.getOc1Quantity();
            addCellToTable(orderTable, String.format("%.2f", montant), normalFont, rowColor);
            int ecart = item.getOc1Quantity() - item.getMaxArticles();
            addCellToTable(orderTable, String.valueOf(ecart), normalFont, rowColor);
            totalMontant += montant;
            rowNum++;
        }

        // Summary row
        addCellToTable(orderTable, "TOTAL GENERAL", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, String.format("%.2f", totalMontant), headerFont, BaseColor.LIGHT_GRAY);
        addCellToTable(orderTable, "", headerFont, BaseColor.LIGHT_GRAY);

        orderTable.setSpacingAfter(20);
        document.add(orderTable);

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
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

    public byte[] genererRapportTrimestriel(List<EvaluationTrimestrielle> evaluations, String trimestre) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fonts
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLUE);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
        Font tableHeaderFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

        // Title
        Paragraph title = new Paragraph("RAPPORT TRIMESTRIEL DE SUIVI DE MAINTENANCE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Trimestre: " + trimestre + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        headerInfo.setSpacingAfter(20);
        document.add(headerInfo);

        // Summary statistics
        Paragraph summaryTitle = new Paragraph("RÉSUMÉ STATISTIQUE", sectionFont);
        summaryTitle.setSpacingAfter(10);
        document.add(summaryTitle);

        PdfPTable summaryTable = new PdfPTable(3);
        summaryTable.setWidthPercentage(100);
        summaryTable.setWidths(new float[]{2f, 1f, 1f});

        addCellToTable(summaryTable, "Indicateur", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(summaryTable, "Nombre", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(summaryTable, "Pourcentage", tableHeaderFont, BaseColor.BLUE);

        int totalEvaluations = evaluations.size();
        long evaluationsCompletes = evaluations.stream().filter(e -> e.getNoteFinale() != null).count();
        long bonnesEvaluations = evaluations.stream().filter(e -> e.getNoteFinale() != null && e.getNoteFinale().doubleValue() >= 6.0).count();

        addCellToTable(summaryTable, "Évaluations réalisées", normalFont, BaseColor.WHITE);
        addCellToTable(summaryTable, String.valueOf(evaluationsCompletes), normalFont, BaseColor.WHITE);
        addCellToTable(summaryTable, String.format("%.1f%%", (double) evaluationsCompletes / totalEvaluations * 100), normalFont, BaseColor.WHITE);

        addCellToTable(summaryTable, "Évaluations satisfaisantes (≥6/8)", normalFont, BaseColor.WHITE);
        addCellToTable(summaryTable, String.valueOf(bonnesEvaluations), normalFont, BaseColor.WHITE);
        addCellToTable(summaryTable, String.format("%.1f%%", (double) bonnesEvaluations / totalEvaluations * 100), normalFont, BaseColor.WHITE);

        summaryTable.setSpacingAfter(20);
        document.add(summaryTable);

        // Detailed evaluations table
        Paragraph detailsTitle = new Paragraph("DÉTAIL DES ÉVALUATIONS", sectionFont);
        detailsTitle.setSpacingAfter(10);
        document.add(detailsTitle);

        PdfPTable detailsTable = new PdfPTable(5);
        detailsTable.setWidthPercentage(100);
        detailsTable.setWidths(new float[]{1f, 2f, 1f, 1f, 2f});

        addCellToTable(detailsTable, "Lot", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(detailsTable, "Prestataire", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(detailsTable, "Note", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(detailsTable, "Recommandation", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(detailsTable, "Observations", tableHeaderFont, BaseColor.BLUE);

        for (EvaluationTrimestrielle evaluation : evaluations) {
            BaseColor rowColor = evaluations.indexOf(evaluation) % 2 == 0 ? BaseColor.WHITE : new BaseColor(245, 245, 245);
            addCellToTable(detailsTable, evaluation.getLot(), normalFont, rowColor);
            addCellToTable(detailsTable, evaluation.getPrestataireNom(), normalFont, rowColor);
            addCellToTable(detailsTable, evaluation.getNoteFinale() != null ? String.format("%.1f/8", evaluation.getNoteFinale()) : "N/A", normalFont, rowColor);
            addCellToTable(detailsTable, evaluation.getNoteFinale() != null ? getRecommandationText(Math.round(evaluation.getNoteFinale().floatValue())) : "N/A", normalFont, rowColor);
            String obs = evaluation.getObservationsGenerales();
            if (obs != null && obs.length() > 50) {
                obs = obs.substring(0, 47) + "...";
            }
            addCellToTable(detailsTable, obs != null ? obs : "Aucune", normalFont, rowColor);
        }

        detailsTable.setSpacingAfter(20);
        document.add(detailsTable);

        // Footer
        Paragraph footer = new Paragraph("Rapport généré par le système DGSI Maintenance - " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] genererRapportAnnuel(List<EvaluationTrimestrielle> evaluations, int annee) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fonts
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLUE);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
        Font tableHeaderFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

        // Title
        Paragraph title = new Paragraph("RAPPORT ANNUEL DE MAINTENANCE INFORMATIQUE " + annee, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Année: " + annee + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        headerInfo.setSpacingAfter(20);
        document.add(headerInfo);

        // Annual statistics by trimestre
        Paragraph statsTitle = new Paragraph("STATISTIQUES ANNUELLES PAR TRIMESTRE", sectionFont);
        statsTitle.setSpacingAfter(10);
        document.add(statsTitle);

        PdfPTable annualTable = new PdfPTable(6);
        annualTable.setWidthPercentage(100);
        annualTable.setWidths(new float[]{1f, 1f, 1f, 1f, 1f, 1f});

        addCellToTable(annualTable, "Trimestre", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(annualTable, "Évaluations", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(annualTable, "Note Moyenne", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(annualTable, "Satisfaisants (≥6)", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(annualTable, "Taux Satisfaction", tableHeaderFont, BaseColor.BLUE);
        addCellToTable(annualTable, "Recommandation", tableHeaderFont, BaseColor.BLUE);

        String[] trimestres = {"T1", "T2", "T3", "T4"};
        for (String trimestre : trimestres) {
            List<EvaluationTrimestrielle> evalTrimestre = evaluations.stream()
                    .filter(e -> trimestre.equals(e.getTrimestre()))
                    .toList();

            long count = evalTrimestre.size();
            double avgNote = evalTrimestre.stream()
                    .filter(e -> e.getNoteFinale() != null)
                    .mapToDouble(e -> e.getNoteFinale().doubleValue())
                    .average()
                    .orElse(0.0);

            long satisfaisants = evalTrimestre.stream()
                    .filter(e -> e.getNoteFinale() != null && e.getNoteFinale().doubleValue() >= 6.0)
                    .count();

            double tauxSatisfaction = count > 0 ? (double) satisfaisants / count * 100 : 0;

            String recommandation = "N/A";
            if (avgNote >= 7.0) recommandation = "EXCELLENT";
            else if (avgNote >= 6.0) recommandation = "BON";
            else if (avgNote >= 5.0) recommandation = "MOYEN";
            else recommandation = "INSATISFAISANT";

            BaseColor rowColor = trimestres[0].equals(trimestre) ? BaseColor.WHITE : new BaseColor(245, 245, 245);
            addCellToTable(annualTable, trimestre, normalFont, rowColor);
            addCellToTable(annualTable, String.valueOf(count), normalFont, rowColor);
            addCellToTable(annualTable, String.format("%.1f", avgNote), normalFont, rowColor);
            addCellToTable(annualTable, String.valueOf(satisfaisants), normalFont, rowColor);
            addCellToTable(annualTable, String.format("%.1f%%", tauxSatisfaction), normalFont, rowColor);
            addCellToTable(annualTable, recommandation, normalFont, rowColor);
        }

        annualTable.setSpacingAfter(20);
        document.add(annualTable);

        // Global statistics
        Paragraph globalTitle = new Paragraph("BILAN ANNUEL GLOBAL", sectionFont);
        globalTitle.setSpacingAfter(10);
        document.add(globalTitle);

        double globalAvg = evaluations.stream()
                .filter(e -> e.getNoteFinale() != null)
                .mapToDouble(e -> e.getNoteFinale().doubleValue())
                .average()
                .orElse(0.0);

        long globalSatisfaisants = evaluations.stream()
                .filter(e -> e.getNoteFinale() != null && e.getNoteFinale().doubleValue() >= 6.0)
                .count();

        double globalTaux = evaluations.size() > 0 ? (double) globalSatisfaisants / evaluations.size() * 100 : 0;

        Paragraph bilan = new Paragraph(
            "Note moyenne annuelle: " + String.format("%.1f/8", globalAvg) + "\n" +
            "Taux de satisfaction global: " + String.format("%.1f%%", globalTaux) + "\n" +
            "Nombre total d'évaluations: " + evaluations.size(), normalFont);
        bilan.setSpacingAfter(20);
        document.add(bilan);

        // Footer
        Paragraph footer = new Paragraph("Rapport annuel généré par le système DGSI Maintenance - " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] genererOrdreCommandeDetail(OrdreCommande ordre) throws DocumentException {
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
        Paragraph title = new Paragraph("DÉTAILS DE L'ORDRE DE COMMANDE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Header information
        Paragraph headerInfo = new Paragraph("Numéro OC: " + (ordre.getNumeroOc() != null ? ordre.getNumeroOc() : ordre.getIdOC()) + " | Date de génération: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
        headerInfo.setSpacingAfter(20);
        document.add(headerInfo);

        // Informations générales
        Paragraph generalTitle = new Paragraph("I. INFORMATIONS GÉNÉRALES", sectionFont);
        generalTitle.setSpacingAfter(10);
        document.add(generalTitle);

        PdfPTable generalTable = new PdfPTable(2);
        generalTable.setWidthPercentage(100);
        generalTable.setWidths(new float[]{1, 2});

        addCellToTable(generalTable, "Numéro OC:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(generalTable, ordre.getNumeroOc() != null ? ordre.getNumeroOc().toString() : ordre.getIdOC(), normalFont, BaseColor.WHITE);

        addCellToTable(generalTable, "Item:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(generalTable, ordre.getNomItem() != null ? ordre.getNomItem() : "-", normalFont, BaseColor.WHITE);

        addCellToTable(generalTable, "Prestataire:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(generalTable, ordre.getPrestataireItem() != null ? ordre.getPrestataireItem() : "-", normalFont, BaseColor.WHITE);

        addCellToTable(generalTable, "Statut:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(generalTable, ordre.getStatut() != null ? ordre.getStatut().toString() : "-", normalFont, BaseColor.WHITE);

        addCellToTable(generalTable, "Observations:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(generalTable, ordre.getObservations() != null ? ordre.getObservations() : "-", normalFont, BaseColor.WHITE);

        generalTable.setSpacingAfter(20);
        document.add(generalTable);

        // Quantités & Prix
        Paragraph quantitesTitle = new Paragraph("II. QUANTITÉS & PRIX", sectionFont);
        quantitesTitle.setSpacingAfter(10);
        document.add(quantitesTitle);

        PdfPTable quantitesTable = new PdfPTable(2);
        quantitesTable.setWidthPercentage(100);
        quantitesTable.setWidths(new float[]{1, 2});

        addCellToTable(quantitesTable, "Min prestations:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(quantitesTable, String.valueOf(ordre.getMin_prestations() != null ? ordre.getMin_prestations() : 0), normalFont, BaseColor.WHITE);

        addCellToTable(quantitesTable, "Max prestations:", normalFont, BaseColor.LIGHT_GRAY);
        int maxPrestations = ordre.getItems() != null && !ordre.getItems().isEmpty() ?
            ordre.getItems().stream().mapToInt(item -> item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0).max().orElse(0) :
            (ordre.getMax_prestations() != null ? ordre.getMax_prestations() : 0);
        addCellToTable(quantitesTable, String.valueOf(maxPrestations), normalFont, BaseColor.WHITE);

        addCellToTable(quantitesTable, "Prix unitaire:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(quantitesTable, String.format("%.2f FCFA", ordre.getPrixUnitPrest() != null ? ordre.getPrixUnitPrest() : 0.0f), normalFont, BaseColor.WHITE);

        addCellToTable(quantitesTable, "Montant total:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(quantitesTable, String.format("%.2f FCFA", ordre.getMontant() != null ? ordre.getMontant() : 0.0), normalFont, BaseColor.WHITE);

        addCellToTable(quantitesTable, "Écart:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(quantitesTable, String.valueOf(ordre.calculer_ecart_item()), normalFont, BaseColor.WHITE);

        addCellToTable(quantitesTable, "Pénalités:", normalFont, BaseColor.LIGHT_GRAY);
        addCellToTable(quantitesTable, String.format("%.2f FCFA", ordre.calcul_penalite()), normalFont, BaseColor.WHITE);

        quantitesTable.setSpacingAfter(20);
        document.add(quantitesTable);

        // Prestations associées
        if (ordre.getPrestations() != null && !ordre.getPrestations().isEmpty()) {
            Paragraph prestationsTitle = new Paragraph("III. PRESTATIONS ASSOCIÉES", sectionFont);
            prestationsTitle.setSpacingAfter(10);
            document.add(prestationsTitle);

            PdfPTable prestationsTable = new PdfPTable(5);
            prestationsTable.setWidthPercentage(100);
            prestationsTable.setWidths(new float[]{0.5f, 2f, 1.5f, 1f, 1f});

            addCellToTable(prestationsTable, "N°", tableHeaderFont, BaseColor.BLUE);
            addCellToTable(prestationsTable, "Prestation", tableHeaderFont, BaseColor.BLUE);
            addCellToTable(prestationsTable, "Prestataire", tableHeaderFont, BaseColor.BLUE);
            addCellToTable(prestationsTable, "Montant", tableHeaderFont, BaseColor.BLUE);
            addCellToTable(prestationsTable, "Statut", tableHeaderFont, BaseColor.BLUE);

            int num = 1;
            for (Prestation prestation : ordre.getPrestations()) {
                BaseColor rowColor = num % 2 == 0 ? BaseColor.WHITE : new BaseColor(245, 245, 245);
                addCellToTable(prestationsTable, String.valueOf(num), normalFont, rowColor);
                addCellToTable(prestationsTable, prestation.getNomPrestation() != null ? prestation.getNomPrestation() : "-", normalFont, rowColor);
                addCellToTable(prestationsTable, prestation.getNomPrestataire() != null ? prestation.getNomPrestataire() : "-", normalFont, rowColor);
                addCellToTable(prestationsTable, String.format("%.2f FCFA", prestation.getMontantPrest() != null ? prestation.getMontantPrest().doubleValue() : 0.0), normalFont, rowColor);
                addCellToTable(prestationsTable, prestation.getStatut() != null ? prestation.getStatut() : "-", normalFont, rowColor);
                num++;
            }

            prestationsTable.setSpacingAfter(20);
            document.add(prestationsTable);
        }

        // Footer
        Paragraph footer = new Paragraph("Document généré le " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), smallFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }
}