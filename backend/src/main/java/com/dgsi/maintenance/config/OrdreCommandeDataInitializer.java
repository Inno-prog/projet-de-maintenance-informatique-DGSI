package com.dgsi.maintenance.config;

import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.StatutCommande;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class OrdreCommandeDataInitializer implements CommandLineRunner {

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialiser uniquement si aucune donnée n'existe
        if (ordreCommandeRepository.count() == 0) {
            initializeSampleData();
        }
    }

    private void initializeSampleData() {
        // Données d'exemple OrdreCommande
        OrdreCommande ordre1 = new OrdreCommande();
        ordre1.setNumeroOc(1);
        ordre1.setIdOC("OC-001-2025");
        ordre1.setNomItem("Maintenance Système");
        ordre1.setMin_prestations(5);
        ordre1.setMax_prestations(10);
        ordre1.setPrixUnitPrest(25000.0f);
        ordre1.setMontantOc(250000.0f);
        ordre1.setObservations("Maintenance préventive des systèmes informatiques");
        ordre1.setStatut(StatutCommande.EN_ATTENTE);

        OrdreCommande ordre2 = new OrdreCommande();
        ordre2.setNumeroOc(2);
        ordre2.setIdOC("OC-002-2025");
        ordre2.setNomItem("Installation Réseau");
        ordre2.setMin_prestations(3);
        ordre2.setMax_prestations(8);
        ordre2.setPrixUnitPrest(60000.0f);
        ordre2.setMontantOc(480000.0f);
        ordre2.setObservations("Installation et configuration du réseau local");
        ordre2.setStatut(StatutCommande.NON_APPROUVE);

        OrdreCommande ordre3 = new OrdreCommande();
        ordre3.setNumeroOc(3);
        ordre3.setIdOC("OC-003-2025");
        ordre3.setNomItem("Support Technique");
        ordre3.setMin_prestations(2);
        ordre3.setMax_prestations(6);
        ordre3.setPrixUnitPrest(25000.0f);
        ordre3.setMontantOc(150000.0f);
        ordre3.setObservations("Support technique et assistance utilisateurs");
        ordre3.setStatut(StatutCommande.APPROUVE);

        OrdreCommande ordre4 = new OrdreCommande();
        ordre4.setNumeroOc(4);
        ordre4.setIdOC("OC-004-2025");
        ordre4.setNomItem("Mise à jour Logiciels");
        ordre4.setMin_prestations(4);
        ordre4.setMax_prestations(12);
        ordre4.setPrixUnitPrest(26666.67f);
        ordre4.setMontantOc(320000.0f);
        ordre4.setObservations("Mise à jour des logiciels et applications");
        ordre4.setStatut(StatutCommande.EN_COURS);

        // Sauvegarder toutes les commandes
        ordreCommandeRepository.save(ordre1);
        ordreCommandeRepository.save(ordre2);
        ordreCommandeRepository.save(ordre3);
        ordreCommandeRepository.save(ordre4);

        System.out.println("Données d'exemple d'ordre de commande initialisées avec succès !");
    }
}