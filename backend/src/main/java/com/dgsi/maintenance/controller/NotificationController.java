package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.Notification;
import com.dgsi.maintenance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{destinataire}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Notification> getNotifications(@PathVariable String destinataire) {
        return notificationService.getNotificationsByDestinataire(destinataire);
    }

    @PutMapping("/{id}/marquer-lu")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<?> marquerCommeLu(@PathVariable Long id) {
        notificationService.marquerCommeLu(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/prestation-terminee")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> notifierPrestationTerminee(
            @RequestParam String prestataire,
            @RequestParam Long prestationId,
            @RequestParam String nomItem) {
        
        notificationService.envoyerNotificationPrestationTerminee(prestataire, prestationId, nomItem);
        return ResponseEntity.ok().build();
    }
}