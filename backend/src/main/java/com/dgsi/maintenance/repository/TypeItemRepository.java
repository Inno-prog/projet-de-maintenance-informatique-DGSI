package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.TypeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TypeItemRepository extends JpaRepository<TypeItem, Long> {
    List<TypeItem> findByLot(String lot);
    boolean existsByNumero(String numero);
}