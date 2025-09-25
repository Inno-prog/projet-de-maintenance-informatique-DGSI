package com.dgsi.maintenance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "correspondants_informatique")
public class CorrespondantInformatique extends User {
    
    @Column(name = "structure")
    private String structure;

    public CorrespondantInformatique() {
        super.setRole("CORRESPONDANT_INFORMATIQUE");
    }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }
}