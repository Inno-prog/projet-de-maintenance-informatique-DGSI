package com.dgsi.maintenance.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PrestationDataInitializer implements CommandLineRunner {

    @Autowired
    private PrestationRepository prestationRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialiser uniquement si aucune donnée n'existe
        if (prestationRepository.count() == 0) {
            initializeSampleData();
        }
    }

    private void initializeSampleData() {
        // Liste des items de maintenance fournis par l'utilisateur
        String[] items = {
            "Installation ou réinstallation des logiciels bureautiques (suite bureautique et utilitaires)",
            "Installation ou réinstallation complète des logiciels système (système d'exploitation, outils bureautique et utilitaires, antivirus, logiciels métiers…)",
            "Installation ou réinstallation des logiciels antivirus",
            "Installation ou réinstallation des logiciels métiers",
            "Réparation de pièces défectueuses d'une carte mère (Ports USB, HDMI, VGA et Display, composants électronique…)",
            "Optimisation de l'ordinateur (défragmentation, nettoyage de DD et de la RAM, suppression des fichiers temporaires, vidage de la corbeille, analyse des disques DD par l'antivirus et suppression d'éventuels fichiers infectés, désinstallation)",
            "Réparation de boitiers d'alimentation",
            "Réparation d'écran toute dimension",
            "Mise en service d'un nouvel ordinateur",
            "Réparation du bouton d'allumage de l'ordinateur",
            "Réparation du chargeur d'alimentation (All In One)",
            "Réinitialisation d'un mot de passe CMOS ou OS",
            "Réparation et récupération de données de disque dur",
            "Sauvegarde et Restauration des données",
            "Fourniture et Remplacement de Disque dur Sata 3.5\" 500 Go",
            "Fourniture et Remplacement de Disque dur Sata 3.5\" 1 To",
            "Fourniture et Remplacement de Disque dur Sata 3.5\" 500 Go SSD",
            "Fourniture et Remplacement de Disque dur Sata 3.5\" 1 To SSD",
            "Remplacement sans fourniture de disque dur",
            "Fourniture et Remplacement de Processeur Intel core i3",
            "Fourniture et Remplacement de Processeur Intel core i5",
            "Fourniture et Remplacement de Processeur Intel core i7",
            "Fourniture et Remplacement de Bloc de refroidissement processeur",
            "Fourniture et Remplacement du Ventilateur du boitier",
            "Fourniture et Remplacement du Ventilateur de la carte graphique",
            "Fourniture et Remplacement de Barrette mémoire 2 Go",
            "Fourniture et Remplacement de Barrette mémoire 4 Go",
            "Fourniture et Remplacement de Barrette mémoire 8 Go",
            "Fourniture et Remplacement de Boitier d'alimentation",
            "Fourniture et Remplacement de Carte graphique (vidéo)",
            "Fourniture et Remplacement de Carte SON (Audio)",
            "Fourniture et Remplacement de Carte réseau",
            "Fourniture et Remplacement de Haut-parleur",
            "Fourniture et Remplacement de Clavier",
            "Fourniture et Remplacement de Souris",
            "Fourniture et Remplacement d'Ecran 18\"",
            "Fourniture et Remplacement de la Dalle d'Ecran 21-22\" All in one",
            "Fourniture et Remplacement de la Dalle d'Ecran 23-24\" All in one",
            "Fourniture et Remplacement de Ecran 21-22\" LCD",
            "Fourniture et Remplacement de Ecran 23-24\" LCD",
            "Fourniture et Remplacement de Cable VGA/HDMI",
            "Fourniture et Remplacement de Câble d'alimentation",
            "Fourniture et Remplacement de Pile CMOS",
            "Fourniture et remplacement de la carte Wifi",
            "Ordinateur de Portable",
            "Installation ou réinstallation des logiciels bureautiques (suite bureautique et utilitaires)",
            "Installation ou réinstallation complète des logiciels système (système d'exploitation, outils bureautique et utilitaires, antivirus, logiciels métier…)",
            "Installation ou réinstallation des logiciels antivirus",
            "Installation ou réinstallation des logiciels métiers",
            "Réparation de pièces défectueuses d'une carte mère (Ports USB, HDMI, VGA, alimentation et Display, composants électronique…)",
            "Optimisation de l'ordinateur ( défragmentation, nettoyage de DD et de la RAM, suppression des fichiers temporaires, vidage de la corbeille, analyse des disques DD par l'antivirus et suppression d'éventuels fichiers infectés, désinstallation)",
            "Réparation d'écran toute dimension",
            "Mise en service d'un nouvel ordinateur",
            "Réparation du bouton d'allumage de l'ordinateur",
            "Réinitialisation d'un mot de passe CMOS ou OS",
            "Réparation du chargeur",
            "Réparation et récupération de données de disque dur",
            "Sauvegarde et Restauration des données",
            "Fourniture et Remplacement de la Dalle d'Ecran LED 15\"",
            "Fourniture et Remplacement de la Dalle d'Ecran LED 17\"",
            "Fourniture et Remplacement de la Dalle d'Ecran LCD 15\"",
            "Fourniture et Remplacement de la Dalle d'Ecran LCD 17\"",
            "Fourniture et Remplacement de Webcam",
            "Réparation de la dalle d'un Ecran toute dimension",
            "Fourniture et Remplacement de Clavier AZERTY",
            "Fourniture et Remplacement de Batterie 3000mAH",
            "Fourniture et Remplacement de Batterie 8000mAH",
            "Fourniture et Remplacement de Batterie 4500mAH",
            "Fourniture et Remplacement de Cordon nappe VGA",
            "Fourniture et Remplacement de Microprocesseur AMD",
            "Fourniture et Remplacement de Microprocesseur Intel core i3",
            "Fourniture et Remplacement de Microprocesseur Intel core i5",
            "Fourniture et Remplacement de Microprocesseur Intel core i7",
            "Fourniture et Remplacement de Carte wifi",
            "Fourniture et Remplacement de Bloc de refroidissement processeur",
            "Fourniture et Remplacement de Barrette mémoire 4 Go",
            "Fourniture et Remplacement de Barrette mémoire 8 Go",
            "Fourniture et Remplacement de Barrette mémoire 16 Go",
            "Fourniture et Remplacement de Disque dur sata 2.5\" 1To",
            "Fourniture et Remplacement de Disque dur 2,5\" SATA SSD 256 Go",
            "Fourniture et Remplacement de Disque dur 2,5\" SATA SSD 500 Go",
            "Fourniture et Remplacement de Disque dur 2,5\" SATA SSD 1 To",
            "Fourniture et Remplacement de Disque dur Ssd M2-NVMe 500Go",
            "Fourniture et Remplacement de Disque dur Ssd M2-NVMe 1 To",
            "Fourniture et Remplacement de Disque dur M2-SATA 500Go",
            "Fourniture et Remplacement de Disque dur M2-SATA 1 To",
            "Remplacement sans fourniture Disque dur",
            "Fourniture et Remplacement de Pile CMOS",
            "Fourniture et Remplacement de cordon d'alimentation",
            "Fourniture et Remplacement de Chargeur d'alimentation",
            "Fourniture et Remplacement de Hauts parleurs",
            "Fourniture et Remplacement de souris",
            "Réparation de système de pointage (Pavé tactile, trackball)",
            "Imprimante (Laser, Jet d'encre, multifonction et matricielle)",
            "Nouvelle mise en service d'une imprimante",
            "Installation ou réinstallation pilote et partage d'une imprimante",
            "Débourrage ou nettoyage du tambour ou des aiguilles",
            "Fourniture et Remplacement du port USB",
            "Fourniture et Remplacement de la carte USB",
            "Fourniture et Remplacement de Carte de commande",
            "Fourniture et Remplacement de Film",
            "Fourniture et Remplacement de Patin de prise de papier (Rollers)",
            "Fourniture et Remplacement de Kit de patin de prise de papier (Kit Rollers)",
            "Fourniture et Remplacement de la Carte d'alimentation",
            "Fourniture et Remplacement de la Carte réseau",
            "Fourniture et Remplacement de Four (Kit de fusion)",
            "Fourniture et Remplacement de Kit d'engrenage (pignons)",
            "Fourniture et Remplacement de Câble d'alimentation",
            "Fourniture et Remplacement de Rouleau chauffant",
            "Fourniture et Remplacement de Rouleau de pression",
            "Fourniture et Remplacement résistance chauffante",
            "Fourniture et Remplacement de Câble USB",
            "Fourniture et Remplacement de port Réseau",
            "Fourniture et Remplacement de Tête d'impression",
            "Fourniture et Remplacement de Chariot des cartouches",
            "Fourniture et Remplacement de l'Interrupteur marche/Arrêt",
            "Fourniture et Remplacement de l'adaptateur secteur",
            "Fourniture et Remplacement de Détecteur papier",
            "Fourniture et Remplacement de Nappe de tête d'impression",
            "Onduleur",
            "Nouvelle mise en service",
            "Réparation de la carte principale",
            "Fourniture et Remplacement de Batterie de 12 V - 7 A",
            "Fourniture et Remplacement de Batterie de 12 V - 9 A",
            "Fourniture et Remplacement de la Carte principale",
            "Fourniture et Remplacement de Câble IEC C14 C15",
            "Fourniture et Remplacement de la Carte de commande",
            "Scanneur et Disques externes",
            "Nouvelle mise en service d'un scanner",
            "Installation ou réinstallation du pilote",
            "Débourrage du scanner",
            "Fourniture et Remplacement du cordon d'alimentation scanneur",
            "Fourniture et Remplacement de Carte de commande",
            "Fourniture et Remplacement de Capot de chargeur de document",
            "Fourniture et Remplacement de Rouleau de séparation (patin de séparation)",
            "Fourniture et Remplacement de Rouleau d'entrainement (patin d'entrainement)",
            "Fourniture et Remplacement de Module du rouleau d'entrainement",
            "Fourniture et Remplacement de Capteur d'image",
            "Récupération et restauration de données de disque dur externe",
            "Fourniture et Remplacement du câble de disque dur externe",
            "Fourniture et Remplacement de Câble USB",
            "Réparation du disque dur externe",
            "Maintenance préventive",
            "Ordinateur de bureau",
            "Ordinateur portable",
            "Imprimantes (Laser, jet d'encre, multifonction, matricielle)",
            "Onduleur",
            "Scanner"
        };

        // Prestataires disponibles
        String[] prestataires = {
            "TechServe SARL", "NetCom Afrique", "IT Solutions Burkina", "SoftLink Technologies",
            "InfoTech Burkina", "Digital Solutions", "CyberTech SARL", "TechPro Services"
        };

        // Statuts possibles
        String[] statuts = {"en attente", "en cours", "terminé", "annulé"};

        // Trimestres
        String[] trimestres = {"T1", "T2", "T3", "T4"};

        // Créer des prestations pour chaque item avec des quantités raisonnables
        for (int i = 0; i < items.length; i++) {
            Prestation prestation = new Prestation();

            // Assigner un prestataire (rotation)
            prestation.setNomPrestataire(prestataires[i % prestataires.length]);

            // Nom de la prestation = nom de l'item
            prestation.setNomPrestation(items[i]);

            // Quantité raisonnable (entre 1 et 10 selon le type d'item)
            int quantite = getReasonableQuantity(items[i]);
            prestation.setQuantiteItem(quantite);

            // Nombre réalisé (aléatoire entre 0 et quantité)
            int realise = (int) (Math.random() * (quantite + 1));
            prestation.setNbPrestRealise(realise);

            // Trimestre (distribution équilibrée)
            prestation.setTrimestre(trimestres[i % trimestres.length]);

            // Dates (selon le trimestre)
            LocalDate[] dates = getDatesForTrimestre(trimestres[i % trimestres.length]);
            prestation.setDateDebut(dates[0]);
            prestation.setDateFin(dates[1]);

            // Statut (distribution réaliste)
            prestation.setStatut(statuts[i % statuts.length]);

            // Montant calculé (prix unitaire estimé * quantité)
            BigDecimal prixUnitaire = getEstimatedPrice(items[i]);
            prestation.setMontantPrest(prixUnitaire.multiply(BigDecimal.valueOf(quantite)));

            // Description
            prestation.setDescription("Prestation de maintenance informatique : " + items[i]);

            // Sauvegarder la prestation
            prestationRepository.save(prestation);
        }

        System.out.println("Données de prestations initialisées avec " + items.length + " items de maintenance !");
    }

    private int getReasonableQuantity(String itemName) {
        // Logique pour déterminer des quantités raisonnables selon le type d'item
        if (itemName.contains("logiciels") || itemName.contains("optimisation") ||
            itemName.contains("réinitialisation") || itemName.contains("sauvegarde")) {
            return (int) (Math.random() * 20) + 10; // 10-30 pour les services logiciels
        } else if (itemName.contains("réparation") || itemName.contains("remplacement")) {
            return (int) (Math.random() * 15) + 5; // 5-20 pour les réparations/remplacements
        } else if (itemName.contains("mise en service")) {
            return (int) (Math.random() * 10) + 5; // 5-15 pour les mises en service
        } else {
            return (int) (Math.random() * 25) + 5; // 5-30 par défaut
        }
    }

    private BigDecimal getEstimatedPrice(String itemName) {
        // Prix unitaires estimés en FCFA selon le type d'item
        if (itemName.contains("logiciels") || itemName.contains("optimisation") ||
            itemName.contains("réinitialisation") || itemName.contains("sauvegarde")) {
            return new BigDecimal("5000.00"); // Services logiciels
        } else if (itemName.contains("réparation")) {
            return new BigDecimal("3000.00"); // Réparations simples
        } else if (itemName.contains("Disque dur") || itemName.contains("SSD")) {
            return new BigDecimal("25000.00"); // Disques durs
        } else if (itemName.contains("Processeur")) {
            return new BigDecimal("15000.00"); // Processeurs
        } else if (itemName.contains("mémoire") || itemName.contains("Barrette")) {
            return new BigDecimal("10000.00"); // Mémoire RAM
        } else if (itemName.contains("Carte graphique")) {
            return new BigDecimal("50000.00"); // Cartes graphiques
        } else if (itemName.contains("Clavier") || itemName.contains("Souris") ||
                   itemName.contains("Haut-parleur")) {
            return new BigDecimal("5000.00"); // Périphériques simples
        } else {
            return new BigDecimal("10000.00"); // Prix par défaut
        }
    }

    private LocalDate[] getDatesForTrimestre(String trimestre) {
        LocalDate[] dates = new LocalDate[2];
        int year = 2025;

        switch (trimestre) {
            case "T1":
                dates[0] = LocalDate.of(year, 1, 1);
                dates[1] = LocalDate.of(year, 3, 31);
                break;
            case "T2":
                dates[0] = LocalDate.of(year, 4, 1);
                dates[1] = LocalDate.of(year, 6, 30);
                break;
            case "T3":
                dates[0] = LocalDate.of(year, 7, 1);
                dates[1] = LocalDate.of(year, 9, 30);
                break;
            case "T4":
                dates[0] = LocalDate.of(year, 10, 1);
                dates[1] = LocalDate.of(year, 12, 31);
                break;
            default:
                dates[0] = LocalDate.of(year, 1, 1);
                dates[1] = LocalDate.of(year, 12, 31);
        }

        return dates;
    }
}
