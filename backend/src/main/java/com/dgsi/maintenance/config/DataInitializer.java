package com.dgsi.maintenance.config;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.TypeItem;
import com.dgsi.maintenance.repository.TypeItemRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    private static final Logger logger = Logger.getLogger(DataInitializer.class.getName());

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, TypeItemRepository typeItemRepository, @org.springframework.lang.Nullable PasswordEncoder passwordEncoder) {
        return args -> {
            // Avec Keycloak, nous n'avons pas besoin de créer d'utilisateurs locaux
            logger.info("Data initialization skipped - using Keycloak for authentication");

            // Initialiser les types d'items si la base est vide
            if (typeItemRepository.count() == 0) {
                logger.info("Initializing TypeItem data...");
                initTypeItems(typeItemRepository);
                logger.info("TypeItem data initialized");
            }


            // Vérifier si la base de données est accessible
            try {
                long userCount = userRepository.count();
                logger.info("Database connection successful. Current user count: " + userCount);
            } catch (Exception e) {
                logger.warning("Database connection issue: " + e.getMessage());
            }

            // Ensure a local AgentDGSI exists so that after Keycloak authentication
            // the backend can load user details (authorities/role) from the database.
            try {
                String agentEmail = "agent@gmail.com";
                if (!userRepository.findByEmail(agentEmail).isPresent()) {
                    logger.info("Creating local AgentDGSI user with email: " + agentEmail);
                    com.dgsi.maintenance.entity.AgentDGSI agent = new com.dgsi.maintenance.entity.AgentDGSI();
                    agent.setNom("Agent DGSI");
                    agent.setEmail(agentEmail);
                    // Use PasswordEncoder if available, otherwise store plain (for dev only)
                    if (passwordEncoder != null) {
                        agent.setPassword(passwordEncoder.encode("agent123"));
                    } else {
                        agent.setPassword("agent123");
                    }
                    agent.setContact(null);
                    agent.setAdresse(null);
                    agent.setQualification(null);
                    // role is set in AgentDGSI constructor to AGENT_DGSI
                    userRepository.save(agent);
                    logger.info("Local AgentDGSI created");
                } else {
                    logger.info("Local AgentDGSI already exists, skipping creation");
                }
            } catch (Exception e) {
                logger.warning("Error creating local AgentDGSI: " + e.getMessage());
            }
        };
    }

    private void initTypeItems(TypeItemRepository typeItemRepository) {
        List<TypeItem> items = Arrays.asList(
            // Lot 1: Ordinateur de bureau
            new TypeItem(null, "1.1", "Installation ou réinstallation des logiciels bureautiques (suite bureautique et utilitaires)", 72, 126, 3000, "Ordinateur de bureau", 30),
            new TypeItem(null, "1.2", "Installation ou réinstallation complète des logiciels système (système d'exploitation, outils bureautique et utilitaires, antivirus, logiciels métiers…)", 54, 95, 4000, "Ordinateur de bureau", 20),
            new TypeItem(null, "1.3", "Installation ou réinstallation des logiciels antivirus", 22, 39, 3000, "Ordinateur de bureau", 15),
            new TypeItem(null, "1.4", "Installation ou réinstallation des logiciels métiers", 11, 19, 3000, "Ordinateur de bureau", 3),
            new TypeItem(null, "1.5", "Réparation de pièces défectueuses d'une carte mère (Ports USB, HDMI, VGA et Display, composants électronique…)", 20, 35, 1000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.6", "Optimisation de l'ordinateur (défragmentation, nettoyage de DD et de la RAM, suppression des fichiers temporaires, vidage de la corbeille, analyse des disques DD par l'antivirus et suppression d'éventuels fichiers infectés, désinstallation)", 54, 95, 3000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.7", "Réparation de boitiers d'alimentation", 11, 19, 1000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.8", "Réparation d'écran toute dimension", 11, 19, 1000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.9", "Mise en service d'un nouvel ordinateur", 40, 70, 2000, "Ordinateur de bureau", 2),
            new TypeItem(null, "1.10", "Réparation du bouton d'allumage de l'ordinateur", 11, 19, 2000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.11", "Réparation du chargeur d'alimentation (All In One)", 5, 9, 2000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.12", "Réinitialisation d'un mot de passe CMOS ou OS", 5, 9, 2000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.13", "Réparation et récupération de données de disque dur", 11, 19, 5000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.14", "Sauvegarde et Restauration des données", 13, 23, 5000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.15", "Fourniture et Remplacement de Disque dur Sata 3.5\" 500 Go", 5, 9, 15000, "Ordinateur de bureau", 3),
            new TypeItem(null, "1.16", "Fourniture et Remplacement de Disque dur Sata 3.5\" 1 To", 11, 19, 20000, "Ordinateur de bureau", 1),
            new TypeItem(null, "1.17", "Fourniture et Remplacement de Disque dur Sata 3.5\" 500 Go SSD", 11, 19, 25000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.18", "Fourniture et Remplacement de Disque dur Sata 3.5\" 1 To SSD", 7, 12, 40000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.19", "Remplacement sans fourniture de disque dur", 7, 12, 2000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.20", "Fourniture et Remplacement de Processeur Intel core i3", 3, 5, 5000, "Ordinateur de bureau", 1),
            new TypeItem(null, "1.21", "Fourniture et Remplacement de Processeur Intel core i5", 3, 5, 10000, "Ordinateur de bureau", 1),
            new TypeItem(null, "1.22", "Fourniture et Remplacement de Processeur Intel core i7", 3, 5, 15000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.23", "Fourniture et Remplacement de Bloc de refroidissement processeur", 3, 5, 5000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.24", "Fourniture et Remplacement du Ventilateur du boitier", 3, 5, 1000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.25", "Fourniture et Remplacement du Ventilateur de la carte graphique", 3, 5, 1000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.26", "Fourniture et Remplacement de Barrette mémoire 2 Go", 11, 19, 5000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.27", "Fourniture et Remplacement de Barrette mémoire 4 Go", 26, 35, 15000, "Ordinateur de bureau", 10),
            new TypeItem(null, "1.28", "Fourniture et Remplacement de Barrette mémoire 8 Go", 11, 19, 20000, "Ordinateur de bureau", 10),
            new TypeItem(null, "1.29", "Fourniture et Remplacement de Boitier d'alimentation", 5, 9, 5000, "Ordinateur de bureau", 1),
            new TypeItem(null, "1.30", "Fourniture et Remplacement de Carte graphique (vidéo)", 2, 4, 130000, "Ordinateur de bureau", 4),
            new TypeItem(null, "1.31", "Fourniture et Remplacement de Carte SON (Audio)", 5, 9, 3000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.32", "Fourniture et Remplacement de Carte réseau", 11, 19, 5000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.33", "Fourniture et Remplacement de Haut-parleur", 5, 9, 4000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.34", "Fourniture et Remplacement de Clavier", 11, 19, 6000, "Ordinateur de bureau", 2),
            new TypeItem(null, "1.35", "Fourniture et Remplacement de Souris", 11, 19, 4000, "Ordinateur de bureau", 6),
            new TypeItem(null, "1.36", "Fourniture et Remplacement d'Ecran 18\"", 2, 4, 125000, "Ordinateur de bureau", 2),
            new TypeItem(null, "1.37", "Fourniture et Remplacement de la Dalle d'Ecran 21-22\" All in one", 2, 4, 100000, "Ordinateur de bureau", 3),
            new TypeItem(null, "1.38", "Fourniture et Remplacement de la Dalle d'Ecran 23-24\" All in one", 2, 4, 100000, "Ordinateur de bureau", 2),
            new TypeItem(null, "1.39", "Fourniture et Remplacement de Ecran 2122\" LCD", 2, 4, 130000, "Ordinateur de bureau", 2),
            new TypeItem(null, "1.40", "Fourniture et Remplacement de Ecran 2324\" LCD", 2, 4, 130000, "Ordinateur de bureau", 3),
            new TypeItem(null, "1.41", "Fourniture et Remplacement de Cable VGA/HDMI", 2, 4, 50000, "Ordinateur de bureau", 4),
            new TypeItem(null, "1.42", "Fourniture et Remplacement de Câble d'alimentation", 5, 9, 2000, "Ordinateur de bureau", 0),
            new TypeItem(null, "1.43", "Fourniture et Remplacement de Pile CMOS", 11, 19, 1000, "Ordinateur de bureau", 1),
            new TypeItem(null, "1.44", "Fourniture et remplacement de la carte Wifi", 3, 5, 5000, "Ordinateur de bureau", 0),

            // Lot 2: Ordinateur portable
            new TypeItem(null, "2.1", "Installation ou réinstallation des logiciels bureautiques (suite bureautique et utilitaires)", 20, 35, 4000, "Ordinateur portable", 3),
            new TypeItem(null, "2.2", "Installation ou réinstallation complète des logiciels système (système d'exploitation, outils bureautique et utilitaires, antivirus, logiciels métier…)", 20, 35, 4000, "Ordinateur portable", 2),
            new TypeItem(null, "2.3", "Installation ou réinstallation des logiciels antivirus", 20, 35, 4000, "Ordinateur portable", 0),
            new TypeItem(null, "2.4", "Installation ou réinstallation des logiciels métiers", 11, 19, 4000, "Ordinateur portable", 0),
            new TypeItem(null, "2.5", "Réparation de pièces défectueuses d'une carte mère (Ports USB, HDMI, VGA, alimentation et Display, composants électronique…)", 6, 11, 2000, "Ordinateur portable", 0),
            new TypeItem(null, "2.6", "Optimisation de l'ordinateur (défragmentation, nettoyage de DD et de la RAM, suppression des fichiers temporaires, vidage de la corbeille, analyse des disques DD par l'antivirus et suppression d'éventuels fichiers infectés, désinstallation)", 12, 21, 4000, "Ordinateur portable", 0),
            new TypeItem(null, "2.7", "Réparation d'écran toute dimension", 12, 21, 2000, "Ordinateur portable", 0),
            new TypeItem(null, "2.8", "Mise en service d'un nouvel ordinateur", 20, 35, 2000, "Ordinateur portable", 0),
            new TypeItem(null, "2.9", "Réparation du bouton d'allumage de l'ordinateur", 2, 4, 50000, "Ordinateur portable", 0),
            new TypeItem(null, "2.10", "Réinitialisation d'un mot de passe CMOS ou OS", 4, 7, 2000, "Ordinateur portable", 0),
            new TypeItem(null, "2.11", "Réparation du chargeur", 10, 18, 1000, "Ordinateur portable", 0),
            new TypeItem(null, "2.12", "Réparation et récupération de données de disque dur", 6, 11, 3000, "Ordinateur portable", 0),
            new TypeItem(null, "2.13", "Sauvegarde et Restauration des données", 15, 22, 3000, "Ordinateur portable", 0),
            new TypeItem(null, "2.14", "Fourniture et Remplacement de la Dalle d'Ecran LED 15\"", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.15", "Fourniture et Remplacement de la Dalle d'Ecran LED 17\"", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.16", "Fourniture et Remplacement de la Dalle d'Ecran LCD 15\"", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.17", "Fourniture et Remplacement de la Dalle d'Ecran LCD 17\"", 15, 26, 2000, "Ordinateur portable", 0),
            new TypeItem(null, "2.18", "Fourniture et Remplacement de Webcam", 1, 2, 130000, "Ordinateur portable", 0),
            new TypeItem(null, "2.19", "Réparation de la dalle d'un Ecran toute dimension", 8, 14, 3000, "Ordinateur portable", 0),
            new TypeItem(null, "2.20", "Fourniture et Remplacement de Clavier AZERTY", 6, 11, 5000, "Ordinateur portable", 0),
            new TypeItem(null, "2.21", "Fourniture et Remplacement de Batterie 3000mAH", 10, 18, 10000, "Ordinateur portable", 0),
            new TypeItem(null, "2.22", "Fourniture et Remplacement de Batterie 8000mAH", 10, 18, 15000, "Ordinateur portable", 0),
            new TypeItem(null, "2.23", "Fourniture et Remplacement de Batterie 4500mAH", 10, 18, 15000, "Ordinateur portable", 0),
            new TypeItem(null, "2.24", "Fourniture et Remplacement de Cordon nappe VGA", 4, 7, 3000, "Ordinateur portable", 0),
            new TypeItem(null, "2.25", "Fourniture et Remplacement de Microprocesseur AMD", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.26", "Fourniture et Remplacement de Microprocesseur Intel core i3", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.27", "Fourniture et Remplacement de Microprocesseur Intel core i5", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.28", "Fourniture et Remplacement de Microprocesseur Intel core i7", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.29", "Fourniture et Remplacement de Carte wifi", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.30", "Fourniture et Remplacement de Bloc de refroidissement processeur", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.31", "Fourniture et Remplacement de Barrette mémoire 4 Go", 4, 7, 10000, "Ordinateur portable", 0),
            new TypeItem(null, "2.32", "Fourniture et Remplacement de Barrette mémoire 8 Go", 4, 7, 20000, "Ordinateur portable", 0),
            new TypeItem(null, "2.33", "Fourniture et Remplacement de Barrette mémoire 16 Go", 4, 7, 30000, "Ordinateur portable", 0),
            new TypeItem(null, "2.34", "Fourniture et Remplacement de Disque dur sata 2.5\" 1To", 4, 7, 25000, "Ordinateur portable", 0),
            new TypeItem(null, "2.35", "Fourniture et Remplacement de Disque dur 2,5\" SATA SSD 256 Go", 4, 7, 20000, "Ordinateur portable", 0),
            new TypeItem(null, "2.36", "Fourniture et Remplacement de Disque dur 2,5\" SATA SSD 500 Go", 6, 11, 30000, "Ordinateur portable", 0),
            new TypeItem(null, "2.37", "Fourniture et Remplacement de Disque dur 2,5\"SATA SSD 1 To", 6, 11, 40000, "Ordinateur portable", 0),
            new TypeItem(null, "2.38", "Fourniture et Remplacement de Disque dur Ssd M2-NVMe 500Go", 1, 2, 150000, "Ordinateur portable", 0),
            new TypeItem(null, "2.39", "Fourniture et Remplacement de Disque dur Ssd M2-NVMe 1 To", 1, 2, 150000, "Ordinateur portable", 0),
            new TypeItem(null, "2.40", "Fourniture et Remplacement de Disque dur M2-SATA 500Go", 1, 2, 150000, "Ordinateur portable", 0),
            new TypeItem(null, "2.41", "Fourniture et Remplacement de Disque dur M2-SATA 1 To", 1, 2, 150000, "Ordinateur portable", 0),
            new TypeItem(null, "2.43", "Fourniture et Remplacement de Pile CMOS", 6, 11, 1000, "Ordinateur portable", 0),
            new TypeItem(null, "2.44", "Fourniture et Remplacement de cordon d'alimentation", 4, 7, 3000, "Ordinateur portable", 0),
            new TypeItem(null, "2.45", "Fourniture et Remplacement de Chargeur d'alimentation", 6, 11, 8000, "Ordinateur portable", 0),
            new TypeItem(null, "2.46", "Fourniture et Remplacement de Hauts parleurs", 2, 4, 100000, "Ordinateur portable", 0),
            new TypeItem(null, "2.47", "Fourniture et Remplacement de souris", 7, 12, 3000, "Ordinateur portable", 0),
            new TypeItem(null, "2.48", "Réparation de système de pointage (Pavé tactile, trackball)", 2, 4, 100000, "Ordinateur portable", 0),

            // Lot 3: Imprimante
            new TypeItem(null, "3.1", "Nouvelle mise en service d'une imprimante", 10, 18, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.2", "Installation ou réinstallation pilote et partage d'une imprimante", 30, 53, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.3", "Débourrage ou nettoyage du tambour ou des aiguilles", 30, 53, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.4", "Fourniture et Remplacement du port USB", 15, 26, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.5", "Fourniture et Remplacement de la carte USB", 15, 26, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.6", "Fourniture et Remplacement de Carte de commande", 12, 21, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.7", "Fourniture et Remplacement de Film", 12, 21, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.8", "Fourniture et Remplacement de Patin de prise de papier (Rollers)", 12, 21, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.9", "Fourniture et Remplacement de Kit de patin de prise de papier (Kit Rollers)", 6, 11, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.10", "Fourniture et Remplacement de la Carte d'alimentation", 4, 7, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.11", "Fourniture et Remplacement de la Carte réseau", 3, 5, 7000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.12", "Fourniture et Remplacement de Four (Kit de fusion)", 6, 11, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.13", "Fourniture et Remplacement de Kit d'engrenage (pignons)", 3, 5, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.14", "Fourniture et Remplacement de Câble d'alimentation", 3, 5, 3000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.15", "Fourniture et Remplacement de Rouleau chauffant", 3, 5, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 1),
            new TypeItem(null, "3.16", "Fourniture et Remplacement de Rouleau de pression", 3, 5, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.17", "Fourniture et Remplacement résistance chauffante", 3, 5, 5000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.18", "Fourniture et Remplacement de Câble USB", 6, 11, 3000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 5),
            new TypeItem(null, "3.19", "Fourniture et Remplacement de port Réseau", 3, 5, 3000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.20", "Fourniture et Remplacement de Tête d'impression", 3, 5, 2000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.21", "Fourniture et Remplacement de Chariot des cartouches", 3, 5, 2000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.22", "Fourniture et Remplacement de l'Interrupteur marche/Arrêt", 3, 5, 2000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.23", "Fourniture et Remplacement de l'adaptateur secteur", 3, 5, 1000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.24", "Fourniture et Remplacement de Détecteur papier", 3, 5, 3000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),
            new TypeItem(null, "3.25", "Fourniture et Remplacement de Nappe de tête d'impression", 3, 5, 2000, "Imprimante (Laser, Jet d'encre, multifonction et matricielle)", 0),

            // Lot 4: Onduleur
            new TypeItem(null, "4.1", "Nouvelle mise en service", 10, 18, 3000, "Onduleur", 0),
            new TypeItem(null, "4.2", "Réparation de la carte principale", 10, 18, 1000, "Onduleur", 0),
            new TypeItem(null, "4.3", "Fourniture et Remplacement de Batterie de 12 V - 7 A", 80, 140, 9000, "Onduleur", 22),
            new TypeItem(null, "4.4", "Fourniture et Remplacement de Batterie de 12 V - 9 A", 25, 44, 6000, "Onduleur", 0),
            new TypeItem(null, "4.6", "Fourniture et Remplacement de la Carte principale", 10, 18, 1000, "Onduleur", 0),
            new TypeItem(null, "4.7", "Fourniture et Remplacement de Câble IEC C14 C15", 10, 18, 1000, "Onduleur", 0),
            new TypeItem(null, "4.8", "Fourniture et Remplacement de la Carte de commande", 10, 18, 5000, "Onduleur", 11),

            // Lot 5: Scanneur et Disques externes
            new TypeItem(null, "5.1", "Nouvelle mise en service d'un scanner", 10, 18, 5000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.2", "Installation ou réinstallation du pilote", 15, 26, 5000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.3", "Débourrage du scanner", 12, 21, 5000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.4", "Fourniture et Remplacement du cordon d'alimentation scanneur", 3, 5, 3000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.5", "Fourniture et Remplacement de Carte de commande", 3, 5, 5000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.6", "Fourniture et Remplacement de Capot de chargeur de document", 3, 5, 2000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.7", "Fourniture et Remplacement de Rouleau de séparation (patin de séparation)", 3, 5, 3000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.8", "Fourniture et Remplacement de Rouleau d'entrainement (patin d'entrainement)", 3, 5, 3000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.9", "Fourniture et Remplacement de Module du rouleau d'entrainement", 3, 5, 3000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.10", "Fourniture et Remplacement de Capteur d'image", 3, 5, 1000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.11", "Récupération et restauration de données de disque dur externe", 3, 5, 5000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.12", "Fourniture et Remplacement du câble de disque dur externe", 3, 5, 2000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.13", "Fourniture et Remplacement de Câble USB", 4, 7, 2000, "Scanneur et Disques externes", 0),
            new TypeItem(null, "5.14", "Réparation du disque dur externe", 3, 5, 2000, "Scanneur et Disques externes", 0),

            // Lot 6: Maintenance préventive
            new TypeItem(null, "6.1", "Ordinateur de bureau", 540, 945, 3000, "Maintenance préventive", 0),
            new TypeItem(null, "6.2", "Ordinateur portable", 100, 175, 3000, "Maintenance préventive", 0),
            new TypeItem(null, "6.3", "Imprimantes (Laser, jet d'encre, multifonction, matricielle)", 200, 350, 2500, "Maintenance préventive", 0),
            new TypeItem(null, "6.4", "Onduleur", 125, 219, 2000, "Maintenance préventive", 0),
            new TypeItem(null, "6.5", "Scanner", 10, 18, 2000, "Maintenance préventive", 0)
        );

        // Batch save for better performance
        typeItemRepository.saveAll(items);
    }


}
