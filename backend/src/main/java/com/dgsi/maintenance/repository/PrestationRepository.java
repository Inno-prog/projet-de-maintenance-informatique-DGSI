package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.Prestation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestationRepository extends JpaRepository<Prestation, Long> {

    List<Prestation> findByNomPrestataire(String nomPrestataire);

    List<Prestation> findByStatut(String statut);

    List<Prestation> findByTrimestre(String trimestre);

    @Query("SELECT p FROM Prestation p WHERE p.nomPrestataire LIKE %:keyword% OR p.nomPrestation LIKE %:keyword%")
    List<Prestation> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT COUNT(p) FROM Prestation p WHERE p.statut = :statut")
    Long countByStatut(@Param("statut") String statut);

    @Query("SELECT SUM(p.montantPrest) FROM Prestation p WHERE p.trimestre = :trimestre")
    Long sumMontantByTrimestre(@Param("trimestre") String trimestre);
}