package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.Equipement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement, Long> {
    List<Equipement> findByNomEquipementContainingIgnoreCase(String nomEquipement);
    List<Equipement> findByMarque(String marque);
}
