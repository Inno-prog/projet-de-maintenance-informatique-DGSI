package com.dgsi.maintenance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "agents_dgsi")
public class AgentDGSI extends User {

    @Column(name = "structure")
    private String structure;

    public AgentDGSI() {
        super.setRole("AGENT_DGSI");
    }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }
}