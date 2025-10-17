package com.dgsi.maintenance.controller;

import java.util.List;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ItemRepository;
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
@RequestMapping("/api/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
            .map(item -> ResponseEntity.ok().body(item))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> searchItemsByName(@RequestParam String nom) {
        return itemRepository.findByNomItemContainingIgnoreCase(nom);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public Item createItem(@RequestBody Item item) {
        // Auto-generate idItem if not provided
        if (item.getIdItem() == null) {
            // Find the maximum idItem and increment by 1
            Integer maxIdItem = itemRepository.findAll().stream()
                .mapToInt(Item::getIdItem)
                .max()
                .orElse(0);
            item.setIdItem(maxIdItem + 1);
        }
        return itemRepository.save(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemRepository.findById(id)
            .map(existingItem -> {
                item.setId(id);
                return ResponseEntity.ok(itemRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        return itemRepository.findById(id)
            .map(item -> {
                itemRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}