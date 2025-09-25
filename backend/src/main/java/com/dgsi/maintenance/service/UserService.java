package com.dgsi.maintenance.service;

import com.dgsi.maintenance.dto.RegisterRequest;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(RegisterRequest registerRequest) {
        User user = new User();
        user.setNom(registerRequest.getNom());
        user.setEmail(registerRequest.getEmail());

        // Avec Keycloak, les mots de passe sont gérés par Keycloak
        if (passwordEncoder != null) {
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        } else {
            // Pour Keycloak, on peut stocker le mot de passe en clair ou le laisser null
            user.setPassword(registerRequest.getPassword());
        }

        user.setContact(registerRequest.getContact());
        user.setAdresse(registerRequest.getAdresse());
        user.setRole(registerRequest.getRole());
        user.setQualification(registerRequest.getQualification());

        return userRepository.save(user);
    }
}