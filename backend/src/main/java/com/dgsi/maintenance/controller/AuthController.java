package com.dgsi.maintenance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
