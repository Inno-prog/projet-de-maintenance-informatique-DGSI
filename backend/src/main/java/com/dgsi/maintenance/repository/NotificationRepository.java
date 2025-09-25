package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireOrderByDateCreationDesc(String destinataire);
    List<Notification> findByDestinataireAndLuFalseOrderByDateCreationDesc(String destinataire);
}