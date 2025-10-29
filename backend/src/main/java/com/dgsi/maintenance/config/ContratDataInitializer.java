package com.dgsi.maintenance.config;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Prestataire;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ContratDataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(ContratDataInitializer.class.getName());

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialiser uniquement si aucune donnée n'existe
        if (contratRepository.count() == 0) {
            logger.info("Initializing Contrat data...");
            initializeSampleData();
            logger.info("Contrat data initialized");
        }
    }

    private void initializeSampleData() {
        // Créer des prestataires d'exemple s'ils n'existent pas
        List<Prestataire> prestataires = createSamplePrestataires();

        // Créer des contrats associés aux prestataires
        createSampleContrats(prestataires);

        logger.info("Sample contracts and prestataires initialized successfully!");
    }

    private List<Prestataire> createSamplePrestataires() {
        Prestataire[] prestataires = {
            createPrestataire("TechServe SARL", "techserve@gmail.com", "TechServe SARL", "Maintenance informatique spécialisée"),
            createPrestataire("NetCom Afrique", "netcom@gmail.com", "NetCom Afrique", "Services réseau et télécommunications"),
            createPrestataire("IT Solutions Burkina", "itsolutions@gmail.com", "IT Solutions Burkina", "Solutions informatiques intégrées"),
            createPrestataire("SoftLink Technologies", "softlink@gmail.com", "SoftLink Technologies", "Développement logiciel et maintenance"),
            createPrestataire("InfoTech Burkina", "infotech@gmail.com", "InfoTech Burkina", "Technologies de l'information"),
            createPrestataire("Digital Solutions", "digitalsolutions@gmail.com", "Digital Solutions", "Solutions numériques"),
            createPrestataire("CyberTech SARL", "cybertech@gmail.com", "CyberTech SARL", "Sécurité informatique"),
            createPrestataire("TechPro Services", "techpro@gmail.com", "TechPro Services", "Services techniques professionnels")
        };

        userRepository.saveAll(Arrays.asList(prestataires));
        return Arrays.asList(prestataires);
    }

    private Prestataire createPrestataire(String nom, String email, String nomEntreprise, String specialite) {
        // Vérifier si le prestataire existe déjà
        if (userRepository.findByEmail(email).isPresent()) {
            return (Prestataire) userRepository.findByEmail(email).get();
        }

        Prestataire prestataire = new Prestataire();
        prestataire.setNom(nom);
        prestataire.setEmail(email);
        prestataire.setPassword("prestataire123"); // Mot de passe par défaut
        prestataire.setContact(String.valueOf(22600000000L + (long)(Math.random() * 99999999))); // Numéro aléatoire
        prestataire.setAdresse("Ouagadougou, Burkina Faso");
        prestataire.setQualification(specialite);
        prestataire.setDocumentContrats("Contrat_" + nom.replace(" ", "_") + ".pdf");
        prestataire.setScoreHistorique(0);

        return prestataire;
    }

    private void createSampleContrats(List<Prestataire> prestataires) {
        // Contrats d'exemple
        Contrat[] contrats = {
            createContrat("CT-001-2025", LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31),
                          prestataires.get(0), 2500000.0, "Contrat de maintenance préventive annuel"),
            createContrat("CT-002-2025", LocalDate.of(2025, 2, 1), LocalDate.of(2025, 7, 31),
                          prestataires.get(1), 1800000.0, "Support technique et assistance utilisateurs"),
            createContrat("CT-003-2025", LocalDate.of(2025, 3, 1), LocalDate.of(2025, 8, 31),
                          prestataires.get(2), 3200000.0, "Installation et configuration réseau"),
            createContrat("CT-004-2025", LocalDate.of(2025, 4, 1), LocalDate.of(2025, 9, 30),
                          prestataires.get(3), 4500000.0, "Développement d'applications métier"),
            createContrat("CT-005-2025", LocalDate.of(2025, 5, 1), LocalDate.of(2025, 10, 31),
                          prestataires.get(6), 2800000.0, "Audit et sécurisation des systèmes"),
            createContrat("CT-006-2025", LocalDate.of(2025, 6, 1), LocalDate.of(2025, 11, 30),
                          prestataires.get(4), 1500000.0, "Formation du personnel informatique"),
            createContrat("CT-007-2025", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 12, 31),
                          prestataires.get(5), 2200000.0, "Maintenance préventive du matériel"),
            createContrat("CT-008-2025", LocalDate.of(2025, 8, 1), LocalDate.of(2026, 1, 31),
                          prestataires.get(7), 3800000.0, "Migration et gestion cloud")
        };

        contratRepository.saveAll(Arrays.asList(contrats));
        for (Contrat contrat : contrats) {
            logger.info("Created contract: " + contrat.getIdContrat() + " for prestataire: " + contrat.getPrestataire().getNom());
        }
    }

    private Contrat createContrat(String idContrat, LocalDate dateDebut, LocalDate dateFin,
                                  Prestataire prestataire, Double montant, String observations) {
        Contrat contrat = new Contrat();
        contrat.setIdContrat(idContrat);
        contrat.setDateDebut(dateDebut);
        contrat.setDateFin(dateFin);
        contrat.setNomPrestataire(prestataire.getNom());
        contrat.setMontant(montant);
        contrat.setPrestataire(prestataire);

        return contrat;
    }
}
