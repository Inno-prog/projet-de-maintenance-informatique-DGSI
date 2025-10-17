package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdreCommandeRepository extends JpaRepository<OrdreCommande, Long> {
    List<OrdreCommande> findByContratPrestataireId(String prestataireId);
    List<OrdreCommande> findByStatut(StatutCommande statut);
    boolean existsByNumeroOc(Integer numeroOc);
}