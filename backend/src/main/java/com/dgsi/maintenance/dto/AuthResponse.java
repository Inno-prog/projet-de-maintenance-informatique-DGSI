package com.dgsi.maintenance.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String nom;
    private String email;
    private String role;

    public AuthResponse(String token, String id, String nom, String email, String role) {
        this.token = token;
        this.id = id;
        this.nom = nom;
        this.email = email;

        // 🔥 Normaliser le rôle (supprimer "ROLE_" si présent)
        if (role != null && role.startsWith("ROLE_")) {
            this.role = role.substring(5);
        } else {
            this.role = role;
        }
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) {
        if (role != null && role.startsWith("ROLE_")) {
            this.role = role.substring(5);
        } else {
            this.role = role;
        }
    }
}
