package com.dgsi.maintenance.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PrestationDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Initialiser uniquement si aucune donnée n'existe
        // Commented out to prevent creation of sample data
        // if (prestationRepository.count() == 0) {
        //     initializeSampleData();
        // }
    }


}
