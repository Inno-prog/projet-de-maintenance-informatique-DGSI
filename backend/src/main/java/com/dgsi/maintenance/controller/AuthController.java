package com.dgsi.maintenance.controller;

import java.util.Arrays;
import java.util.List;
import com.dgsi.maintenance.dto.RegisterRequest;
import com.dgsi.maintenance.entity.Administrator;
import com.dgsi.maintenance.entity.AgentDGSI;
import com.dgsi.maintenance.entity.Prestataire;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.UserRepository;
import com.dgsi.maintenance.service.KeycloakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Valider les données d'entrée
            if (registerRequest.getNom() == null || registerRequest.getNom().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Le nom est obligatoire\"}");
            }
            if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"L'email est obligatoire\"}");
            }
            if (registerRequest.getPassword() == null || registerRequest.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("{\"error\": \"Le mot de passe doit contenir au moins 6 caractères\"}");
            }
            if (registerRequest.getRole() == null || registerRequest.getRole().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Le rôle est obligatoire\"}");
            }

            // Valider le rôle
            String role = registerRequest.getRole().toUpperCase();
            if (!Arrays.asList("ADMINISTRATEUR", "AGENT_DGSI", "PRESTATAIRE").contains(role)) {
                return ResponseEntity.badRequest().body("{\"error\": \"Rôle invalide\"}");
            }

            // Diviser le nom en prénom et nom de famille (en supposant séparé par un espace)
            String[] nameParts = registerRequest.getNom().trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            // Utiliser l'email comme nom d'utilisateur
            String username = registerRequest.getEmail().toLowerCase().trim();

            // Créer l'utilisateur dans Keycloak
            String keycloakUserId = keycloakService.createUser(
                username,
                registerRequest.getEmail(),
                firstName,
                lastName,
                registerRequest.getPassword(),
                role
            );

            // Créer l'utilisateur dans la base de données backend selon le rôle
            User user;
            if ("ADMINISTRATEUR".equals(role)) {
                Administrator admin = new Administrator();
                admin.setPoste(registerRequest.getPoste());
                user = admin;
            } else if ("AGENT_DGSI".equals(role)) {
                AgentDGSI agent = new AgentDGSI();
                agent.setStructure(registerRequest.getStructure());
                user = agent;
            } else {
                // PRESTATAIRE ou par défaut
                Prestataire prestataire = new Prestataire();
                user = prestataire;
            }

            user.setId(keycloakUserId); // Utiliser l'ID utilisateur Keycloak
            user.setNom(registerRequest.getNom());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(""); // Mot de passe stocké dans Keycloak
            user.setContact(registerRequest.getContact());
            user.setAdresse(registerRequest.getAdresse());
            user.setQualification(registerRequest.getQualification());

            userRepository.save(user);

            return ResponseEntity.ok().body("{\"message\": \"User registered successfully\"}");
        } catch (RuntimeException e) {
            // Journaliser l'erreur réelle pour le débogage mais ne pas l'exposer au client
            System.err.println("Erreur d'inscription: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"error\": \"Erreur lors de l'inscription. Veuillez réessayer.\"}");
        } catch (Exception e) {
            // Journaliser les erreurs inattendues mais ne pas exposer les détails internes
            System.err.println("Erreur d'inscription inattendue: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"error\": \"Erreur interne du serveur\"}");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();

            return ResponseEntity.ok().body(new UserInfo(
                jwt.getClaim("preferred_username"),
                jwt.getClaim("email"),
                jwt.getClaim("name"),
                authentication.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .toList()
            ));
        }

        return ResponseEntity.ok().body("{\"message\": \"Not authenticated\"}");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam(required = false) String refreshToken) {
        try {
            // Dans une implémentation JWT sans état, nous ne pouvons pas réellement invalider les tokens
            // côté serveur sans une liste noire de tokens. Cependant, nous pouvons :
            // 1. Journaliser l'événement de déconnexion à des fins d'audit
            // 2. Fournir des conseils au client sur les procédures de déconnexion appropriées
            // 3. Effacer toute session côté serveur si elle existe

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                String username = authentication.getName();
                System.out.println("User logged out: " + username + " at " + new java.util.Date());

                // Effacer le SecurityContext
                SecurityContextHolder.clearContext();
            }

            // Retourner une réponse de succès avec des conseils
            return ResponseEntity.ok().body(
                "{" +
                "\"message\": \"Logout successful\"," +
                "\"note\": \"Please clear tokens from client storage and redirect to application home page\"" +
                "}"
            );
        } catch (Exception e) {
            System.err.println("Erreur de déconnexion: " + e.getMessage());
            return ResponseEntity.ok().body(
                "{" +
                "\"message\": \"Logout completed with warnings\"," +
                "\"note\": \"Please ensure client-side cleanup is performed\"" +
                "}"
            );
        }
    }

    public static class UserInfo {
        private String username;
        private String email;
        private String name;
        private List<String> roles;

        public UserInfo(String username, String email, String name, List<String> roles) {
            this.username = username;
            this.email = email;
            this.name = name;
            this.roles = roles;
        }

        // Getters
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public List<String> getRoles() { return roles; }
    }
}
