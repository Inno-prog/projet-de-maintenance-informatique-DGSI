package com.dgsi.maintenance.controller;

import java.util.List;
import com.dgsi.maintenance.entity.Equipement;
import com.dgsi.maintenance.service.EquipementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/equipements")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EquipementController {

    private static final Logger logger = LoggerFactory.getLogger(EquipementController.class);

    @Autowired
    private EquipementService equipementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Equipement> getAllEquipements() {
        return equipementService.getAllEquipements();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Equipement> getEquipementById(@PathVariable Long id) {
        return equipementService.getEquipementById(id)
            .map(equipement -> ResponseEntity.ok().body(equipement))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Equipement> searchEquipementsByName(@RequestParam String nom) {
        return equipementService.searchEquipementsByName(nom);
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Equipement> getEquipementsByType(@PathVariable String type) {
        return equipementService.getEquipementsByType(type);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public Equipement createEquipement(@RequestBody Equipement equipement) {
        return equipementService.createEquipement(equipement);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Equipement> updateEquipement(@PathVariable Long id, @RequestBody Equipement equipement) {
        try {
            Equipement updatedEquipement = equipementService.updateEquipement(id, equipement);
            return ResponseEntity.ok(updatedEquipement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteEquipement(@PathVariable Long id) {
        try {
            equipementService.deleteEquipement(id);
            return ResponseEntity.ok().<Void>build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/welcome")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<String> welcome() {
        logger.info("Request received: {} {}", "GET", "/api/equipements/welcome");
        return ResponseEntity.ok("{\"message\": \"Welcome to the Equipement API!\"}");
    }
}
