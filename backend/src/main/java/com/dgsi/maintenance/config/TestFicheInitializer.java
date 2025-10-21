package com.dgsi.maintenance.config;

import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Profile("dev")
public class TestFicheInitializer implements CommandLineRunner {

    @Autowired
    private FichePrestationRepository ficheRepository;

    @Autowired
    private OrdreCommandeRepository ordreRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create a test fiche for a prestataire named 'TechServe SARL' to validate OC creation
        FichePrestation f = new FichePrestation();
        f.setNomPrestataire("TechServe SARL");
        f.setNomItem("Test Item");
        f.setQuantite(1);
        f.setDateRealisation(LocalDateTime.now());

        ficheRepository.save(f);

        // Check for OC
        java.util.List<OrdreCommande> ocs = ordreRepository.findByContratPrestataireId("TechServe SARL");
        System.out.println("Test initializer created fiche. OC count for prestataire TechServe SARL: " + ocs.size());
    }
}
