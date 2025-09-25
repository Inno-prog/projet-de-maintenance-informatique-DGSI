package com.dgsi.maintenance.config;

import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.logging.Logger;

@Configuration
public class DataInitializer {
    private static final Logger logger = Logger.getLogger(DataInitializer.class.getName());

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, @org.springframework.lang.Nullable PasswordEncoder passwordEncoder) {
        return args -> {
            // Avec Keycloak, nous n'avons pas besoin de créer d'utilisateurs locaux
            logger.info("Data initialization skipped - using Keycloak for authentication");

            // Vérifier si la base de données est accessible
            try {
                long userCount = userRepository.count();
                logger.info("Database connection successful. Current user count: " + userCount);
            } catch (Exception e) {
                logger.warning("Database connection issue: " + e.getMessage());
            }
        };
    }
}
