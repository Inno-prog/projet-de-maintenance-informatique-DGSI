package com.dgsi.maintenance.security;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Configurer CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Désactiver CSRF pour les points de terminaison API
            .csrf(csrf -> csrf.disable())

            // Configurer la gestion des sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Configurer les en-têtes de sécurité
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .contentTypeOptions(contentTypeOptions -> {})
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                )
                .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
            )

            // Configurer les règles d'autorisation
            .authorizeHttpRequests(authz -> authz
                // Autoriser l'accès non authentifié au point de terminaison d'inscription
                .requestMatchers("/api/auth/register").permitAll()

                // Autoriser l'accès à la console H2 pour le développement (supprimer en production)
                .requestMatchers("/h2-console/**").permitAll()

                // Exiger l'authentification pour toutes les autres requêtes
                .anyRequest().authenticated()
            )

            // Configurer le serveur de ressources OAuth2 avec JWT
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt -> {
                    KeycloakJwtAuthenticationConverter converter = new KeycloakJwtAuthenticationConverter();
                    jwt.jwtAuthenticationConverter(converter);
                })
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Configuration des origines basée sur l'environnement
        boolean isProduction = "production".equals(System.getProperty("spring.profiles.active"));

        if (isProduction) {
            // Production : Autoriser uniquement des domaines spécifiques
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://yourdomain.com",           // Remplacer par votre domaine de production
                "https://www.yourdomain.com",       // Remplacer par votre domaine www
                "https://app.yourdomain.com"        // Remplacer par votre sous-domaine app
            ));
        } else {
            // Développement : Autoriser localhost avec différents ports
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:4200",     // Serveur de développement Angular
                "http://localhost:8080",     // Serveur de développement Keycloak
                "http://localhost:8082"      // Serveur de développement backend
            ));
        }

        // Autoriser des méthodes HTTP spécifiques
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // Autoriser des en-têtes spécifiques
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Cache-Control"
        ));

        // Exposer des en-têtes spécifiques au client
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Length"
        ));

        // Autoriser les informations d'identification (important pour les tokens JWT)
        configuration.setAllowCredentials(true);

        // Mettre en cache la réponse preflight (plus courte en production pour la sécurité)
        configuration.setMaxAge(isProduction ? 1800L : 3600L); // 30 min prod, 1 heure dev

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}