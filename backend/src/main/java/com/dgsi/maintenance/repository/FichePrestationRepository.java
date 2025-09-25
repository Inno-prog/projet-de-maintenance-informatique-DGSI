package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutFiche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FichePrestationRepository extends JpaRepository<FichePrestation, Long> {
    List<FichePrestation> findByNomPrestataire(String nomPrestataire);
    List<FichePrestation> findByStatut(StatutFiche statut);
    List<FichePrestation> findByNomItem(String nomItem);
    boolean existsByIdPrestation(String idPrestation);
}