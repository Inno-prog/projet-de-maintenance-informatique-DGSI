package com.dgsi.maintenance.controller;

import java.util.List;
import com.dgsi.maintenance.entity.TypeItem;
import com.dgsi.maintenance.repository.TypeItemRepository;
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
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public TypeItem createTypeItem(@RequestBody TypeItem typeItem) {
        return typeItemRepository.save(typeItem);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<TypeItem> updateTypeItem(@PathVariable Long id, @RequestBody TypeItem typeItem) {
        return typeItemRepository.findById(id)
            .map(existingItem -> {
                typeItem.setId(id);
                return ResponseEntity.ok(typeItemRepository.save(typeItem));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteTypeItem(@PathVariable Long id) {
        return typeItemRepository.findById(id)
            .map(item -> {
                typeItemRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}