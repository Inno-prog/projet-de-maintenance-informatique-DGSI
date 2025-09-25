package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.DemandeIntervention;
import com.dgsi.maintenance.entity.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeInterventionRepository extends JpaRepository<DemandeIntervention, Long> {
    List<DemandeIntervention> findByPrestataireNom(String prestataireNom);
    List<DemandeIntervention> findByStatut(StatutDemande statut);
    List<DemandeIntervention> findByCategorie(String categorie);
    boolean existsByIdDemande(String idDemande);
}