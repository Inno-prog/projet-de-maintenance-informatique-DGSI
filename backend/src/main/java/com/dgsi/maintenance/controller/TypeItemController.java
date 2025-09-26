package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.TypeItem;
import com.dgsi.maintenance.repository.TypeItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/type-items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TypeItemController {

    @Autowired
    private TypeItemRepository typeItemRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<TypeItem> getAllTypeItems() {
        return typeItemRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<TypeItem> getTypeItemById(@PathVariable Long id) {
        return typeItemRepository.findById(id)
            .map(item -> ResponseEntity.ok().body(item))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lot/{lot}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<TypeItem> getTypeItemsByLot(@PathVariable String lot) {
        return typeItemRepository.findByLot(lot);
    }
}