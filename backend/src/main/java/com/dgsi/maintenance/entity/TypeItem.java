package com.dgsi.maintenance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "type_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TypeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false, length = 1000)
    private String prestation;

    @Column(nullable = false)
    private Integer minArticles;

    @Column(nullable = false)
    private Integer maxArticles;

    @Column(nullable = false)
    private Integer prixUnitaire;

    @Column(nullable = false)
    private String lot;

    @Column(name = "oc1_quantity")
    private Integer oc1Quantity = 0;
}