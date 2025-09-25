package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @userRepository.findById(#id).get().email == authentication.name")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok().body(user))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @userRepository.findById(#id).get().email == authentication.name")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        return userRepository.findById(id)
            .map(user -> {
                user.setNom(userDetails.getNom());
                user.setContact(userDetails.getContact());
                user.setAdresse(userDetails.getAdresse());
                user.setQualification(userDetails.getQualification());
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('CORRESPONDANT_INFORMATIQUE')")
    public ResponseEntity<User> updateProfile(@RequestBody User userDetails, java.security.Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
            .map(user -> {
                user.setNom(userDetails.getNom());
                user.setEmail(userDetails.getEmail());
                user.setContact(userDetails.getContact());
                user.setAdresse(userDetails.getAdresse());
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}