package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.Notification;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.NotificationRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void envoyerNotificationPrestationTerminee(String prestataire, Long prestationId, String nomItem) {
        // Find user by name to get email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Prestation terminée - Rapport requis");
            notification.setMessage(String.format(
                "Votre prestation '%s' est terminée. Veuillez soumettre votre rapport trimestriel et vos fiches de prestations.",
                nomItem
            ));
            notification.setType("WARNING");
            notification.setPrestationId(prestationId);

            notificationRepository.save(notification);
        }
    }

    public void envoyerNotificationEvaluationTerminee(String prestataire, String resultat) {
        // Find user by name to get email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Évaluation terminée");
            notification.setMessage(String.format("Votre évaluation est terminée. Résultat: %s", resultat));
            notification.setType(resultat.equals("DECLASSER") ? "ERROR" : "SUCCESS");

            notificationRepository.save(notification);
        }
    }

    public List<Notification> getNotificationsByDestinataire(String destinataire) {
        return notificationRepository.findByDestinataireOrderByDateCreationDesc(destinataire);
    }

    public void marquerCommeLu(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setLu(true);
            notificationRepository.save(notification);
        });
    }
}