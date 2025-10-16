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
        // Données d'exemple fournies par l'utilisateur
        Prestation prestation1 = new Prestation();
        prestation1.setNomPrestataire("TechServe SARL");
        prestation1.setNomPrestation("Maintenance serveurs régionaux");
        prestation1.setMontantPrest(new BigDecimal("250000.00"));
        prestation1.setQuantiteItem(5);
        prestation1.setNbPrestRealise(3);
        prestation1.setTrimestre("T1");
        prestation1.setDateDebut(LocalDate.of(2025, 1, 10));
        prestation1.setDateFin(LocalDate.of(2025, 3, 20));
        prestation1.setStatut("terminé");
        prestation1.setDescription("Entretien et mise à jour des serveurs dans les directions régionales");

        Prestation prestation2 = new Prestation();
        prestation2.setNomPrestataire("NetCom Afrique");
        prestation2.setNomPrestation("Installation réseau DGSI");
        prestation2.setMontantPrest(new BigDecimal("480000.00"));
        prestation2.setQuantiteItem(10);
        prestation2.setNbPrestRealise(8);
        prestation2.setTrimestre("T2");
        prestation2.setDateDebut(LocalDate.of(2025, 4, 1));
        prestation2.setDateFin(LocalDate.of(2025, 6, 30));
        prestation2.setStatut("en cours");
        prestation2.setDescription("Installation d'un réseau local sécurisé pour la DGSI");

        Prestation prestation3 = new Prestation();
        prestation3.setNomPrestataire("IT Solutions Burkina");
        prestation3.setNomPrestation("Assistance technique utilisateurs");
        prestation3.setMontantPrest(new BigDecimal("150000.00"));
        prestation3.setQuantiteItem(4);
        prestation3.setNbPrestRealise(2);
        prestation3.setTrimestre("T3");
        prestation3.setDateDebut(LocalDate.of(2025, 7, 5));
        prestation3.setDateFin(LocalDate.of(2025, 9, 25));
        prestation3.setStatut("en attente");
        prestation3.setDescription("Support technique et résolution d'incidents utilisateurs");

        Prestation prestation4 = new Prestation();
        prestation4.setNomPrestataire("SoftLink Technologies");
        prestation4.setNomPrestation("Mise à jour applicative");
        prestation4.setMontantPrest(new BigDecimal("320000.00"));
        prestation4.setQuantiteItem(6);
        prestation4.setNbPrestRealise(5);
        prestation4.setTrimestre("T4");
        prestation4.setDateDebut(LocalDate.of(2025, 10, 1));
        prestation4.setDateFin(LocalDate.of(2025, 12, 15));
        prestation4.setStatut("en cours");
        prestation4.setDescription("Mise à jour des applications métier et systèmes");

        // Sauvegarder toutes les prestations
        prestationRepository.save(prestation1);
        prestationRepository.save(prestation2);
        prestationRepository.save(prestation3);
        prestationRepository.save(prestation4);

        System.out.println("Données d'exemple de prestations initialisées avec succès !");
    }
}