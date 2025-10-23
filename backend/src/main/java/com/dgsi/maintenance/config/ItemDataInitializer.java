package com.dgsi.maintenance.config;

import java.util.ArrayList;
import java.util.List;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ItemDataInitializer implements CommandLineRunner {

    @Autowired
    private ItemRepository itemRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialiser uniquement si aucune donnée n'existe
        if (itemRepository.count() == 0) {
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

        // Créer des items pour chaque nom
        List<Item> itemList = new ArrayList<>();
        for (int i = 0; i < items.length; i++) {
            Item item = new Item();
            item.setIdItem(i + 1);
            item.setNomItem(items[i]);
            String itemName = items[i];
            String description = "Item de maintenance informatique : " + formatDescription(itemName);
            item.setDescription(description);
            item.setPrix(getEstimatedPrice(items[i]));
            item.setQteEquipDefini(1);
            item.setQuantiteMaxTrimestre(10); // Default max per trimestre

            itemList.add(item);
        }
        itemRepository.saveAll(itemList);

        System.out.println("Données d'items initialisées avec " + items.length + " items de maintenance !");
    }

    private String formatDescription(String itemName) {
        String[] words = itemName.split(" ");
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < words.length; j++) {
            sb.append(words[j]);
            if ((j + 1) % 4 == 0 && j < words.length - 1) {
                sb.append("\n");
            } else if (j < words.length - 1) {
                sb.append(" ");
            }
        }
        return sb.toString();
    }

    private Float getEstimatedPrice(String itemName) {
        // Prix unitaires estimés en FCFA selon le type d'item
        if (itemName.contains("logiciels") || itemName.contains("optimisation") ||
            itemName.contains("réinitialisation") || itemName.contains("sauvegarde")) {
            return 5000.0f; // Services logiciels
        } else if (itemName.contains("réparation")) {
            return 3000.0f; // Réparations simples
        } else if (itemName.contains("Disque dur") || itemName.contains("SSD")) {
            return 25000.0f; // Disques durs
        } else if (itemName.contains("Processeur")) {
            return 15000.0f; // Processeurs
        } else if (itemName.contains("mémoire") || itemName.contains("Barrette")) {
            return 10000.0f; // Mémoire RAM
        } else if (itemName.contains("Carte graphique")) {
            return 50000.0f; // Cartes graphiques
        } else if (itemName.contains("Clavier") || itemName.contains("Souris") ||
                   itemName.contains("Haut-parleur")) {
            return 5000.0f; // Périphériques simples
        } else {
            return 10000.0f; // Prix par défaut
        }
    }
}