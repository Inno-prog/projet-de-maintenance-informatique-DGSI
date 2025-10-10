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
        // Only initialize if no data exists
        if (ordreCommandeRepository.count() == 0) {
            initializeSampleData();
        }
    }

    private void initializeSampleData() {
        // Sample OrdreCommande data
        OrdreCommande ordre1 = new OrdreCommande();
        ordre1.setNumeroCommande("OC001");
        ordre1.setIdOC("OC-001-2025");
        ordre1.setNomItem("Maintenance Système");
        ordre1.setMinArticles(5);
        ordre1.setMaxArticles(10);
        ordre1.setNombreArticlesUtilise(7);
        ordre1.setTrimestre("T1");
        ordre1.setPrestataireItem("TechServe SARL");
        ordre1.setMontant(250000.0);
        ordre1.setDescription("Maintenance préventive des systèmes informatiques");
        ordre1.setStatut(StatutCommande.EN_ATTENTE);

        OrdreCommande ordre2 = new OrdreCommande();
        ordre2.setNumeroCommande("OC002");
        ordre2.setIdOC("OC-002-2025");
        ordre2.setNomItem("Installation Réseau");
        ordre2.setMinArticles(3);
        ordre2.setMaxArticles(8);
        ordre2.setNombreArticlesUtilise(8);
        ordre2.setTrimestre("T2");
        ordre2.setPrestataireItem("NetCom Afrique");
        ordre2.setMontant(480000.0);
        ordre2.setDescription("Installation et configuration du réseau local");
        ordre2.setStatut(StatutCommande.NON_APPROUVE);

        OrdreCommande ordre3 = new OrdreCommande();
        ordre3.setNumeroCommande("OC003");
        ordre3.setIdOC("OC-003-2025");
        ordre3.setNomItem("Support Technique");
        ordre3.setMinArticles(2);
        ordre3.setMaxArticles(6);
        ordre3.setNombreArticlesUtilise(4);
        ordre3.setTrimestre("T3");
        ordre3.setPrestataireItem("IT Solutions Burkina");
        ordre3.setMontant(150000.0);
        ordre3.setDescription("Support technique et assistance utilisateurs");
        ordre3.setStatut(StatutCommande.APPROUVE);

        OrdreCommande ordre4 = new OrdreCommande();
        ordre4.setNumeroCommande("OC004");
        ordre4.setIdOC("OC-004-2025");
        ordre4.setNomItem("Mise à jour Logiciels");
        ordre4.setMinArticles(4);
        ordre4.setMaxArticles(12);
        ordre4.setNombreArticlesUtilise(10);
        ordre4.setTrimestre("T4");
        ordre4.setPrestataireItem("SoftLink Technologies");
        ordre4.setMontant(320000.0);
        ordre4.setDescription("Mise à jour des logiciels et applications");
        ordre4.setStatut(StatutCommande.EN_COURS);

        // Save all orders
        ordreCommandeRepository.save(ordre1);
        ordreCommandeRepository.save(ordre2);
        ordreCommandeRepository.save(ordre3);
        ordreCommandeRepository.save(ordre4);

        System.out.println("Sample ordre commande data initialized successfully!");
    }
}