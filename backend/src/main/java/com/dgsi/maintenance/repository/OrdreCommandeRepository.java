package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdreCommandeRepository extends JpaRepository<OrdreCommande, Long> {
    List<OrdreCommande> findByContratPrestataireId(String prestataireId);
    List<OrdreCommande> findByStatut(StatutCommande statut);
    boolean existsByNumeroCommande(String numeroCommande);
}