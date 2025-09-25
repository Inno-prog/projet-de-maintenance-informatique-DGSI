package com.dgsi.maintenance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "administrators")
public class Administrator extends User {
    
    @Column(name = "poste")
    private String poste;

    public Administrator() {
        super.setRole("ADMINISTRATEUR");
    }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }
}