package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByPrestataireId(String prestataireId);
    boolean existsByIdContrat(String idContrat);
}