package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByNomItemContainingIgnoreCase(String nomItem);
    boolean existsByIdItem(Integer idItem);
    java.util.Optional<Item> findFirstByNomItem(String nomItem);
    boolean existsByNomItem(String nomItem);
}
