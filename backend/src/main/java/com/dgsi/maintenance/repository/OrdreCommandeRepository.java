package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdreCommandeRepository extends JpaRepository<OrdreCommande, Long> {

    // Trouver les ordres actifs pour un prestataire/trimestre
    List<OrdreCommande> findByPrestataireItemAndTrimestreAndStatutIn(
        String prestataire, String trimestre, List<StatutCommande> statuts);

    // Trouver par prestataire
    List<OrdreCommande> findByPrestataireItem(String prestataire);

    // Chargement eager des prestations
    @Query("SELECT oc FROM OrdreCommande oc LEFT JOIN FETCH oc.prestations WHERE oc.id = :id")
    java.util.Optional<OrdreCommande> findByIdWithPrestations(@Param("id") Long id);

    @Query("SELECT DISTINCT oc FROM OrdreCommande oc LEFT JOIN FETCH oc.prestations")
    List<OrdreCommande> findAllWithPrestations();

    // Existing methods
    List<OrdreCommande> findByContratPrestataireId(String prestataireId);
    List<OrdreCommande> findByStatut(StatutCommande statut);
    boolean existsByNumeroOc(Integer numeroOc);
    // Find ordre de commande for a given trimestre and prestataire name (prestataireItem)
    java.util.Optional<OrdreCommande> findFirstByTrimestreAndPrestataireItem(String trimestre, String prestataireItem);
}