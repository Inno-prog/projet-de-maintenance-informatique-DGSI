package com.dgsi.maintenance.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import java.math.BigDecimal;
import java.util.HashSet;
import com.dgsi.maintenance.entity.Prestation;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class PrestationServiceTest {

    @Autowired
    private PrestationService prestationService;

    @Test
    void testCreatePrestationSuccess() {
        Prestation prestation = new Prestation();
        prestation.setNomPrestation("Ordinateur de bureau");
        prestation.setNomPrestataire("Test Prestataire");
        prestation.setTrimestre("trimestre 1");
        prestation.setMontantPrest(BigDecimal.valueOf(1000.0));
        prestation.setEquipementsUtilises(new HashSet<>());
        prestation.setNbPrestRealise(1);
        prestation.setDateDebut(java.time.LocalDate.now());
        prestation.setDateFin(java.time.LocalDate.now().plusDays(30));
        prestation.setStatut("En cours");

        Prestation result = prestationService.createPrestation(prestation);

        assertNotNull(result.getId());
        assertEquals("Ordinateur de bureau", result.getNomPrestation());
    }
}