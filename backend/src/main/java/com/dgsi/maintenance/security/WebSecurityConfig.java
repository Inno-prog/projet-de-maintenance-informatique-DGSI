package com.dgsi.maintenance.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean isProduction = "production".equals(System.getProperty("spring.profiles.active"));

        // If not production, insert a development authentication filter that grants admin roles
        if (!isProduction) {
            http.addFilterBefore(new OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
                        throws ServletException, IOException {
                    if (SecurityContextHolder.getContext().getAuthentication() == null) {
                        List<SimpleGrantedAuthority> authorities = Arrays.asList(
                                new SimpleGrantedAuthority("ROLE_ADMINISTRATEUR"),
                                new SimpleGrantedAuthority("ROLE_PRESTATAIRE"),
                                new SimpleGrantedAuthority("ROLE_AGENT_DGSI")
                        );
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("dev-admin", null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                    filterChain.doFilter(request, response);
                }
            }, org.springframework.security.web.authentication.AnonymousAuthenticationFilter.class);
        }
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
            )

            // Configurer les règles d'autorisation
            .authorizeHttpRequests(authz -> authz
                // Autoriser l'accès non authentifié au point de terminaison d'inscription
                .requestMatchers("/api/auth/register").permitAll()

                // Autoriser l'accès à la console H2 pour le développement (supprimer en production)
                .requestMatchers("/h2-console/**").permitAll()

                // En développement, autoriser toutes les requêtes API SANS authentification
                .requestMatchers("/api/**").permitAll()

                // Exiger l'authentification pour toutes les autres requêtes (par défaut en prod)
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
