package com.grfconsulting.adhesion.domaine;

import java.time.Instant;
import java.util.UUID;

import com.grfconsulting.authentification.domaine.Utilisateur;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Représente une adhésion annuelle, en attente, active ou expirée. */
@Entity
@Table(name = "adhesions")
public class Adhesion {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
   
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24)
    private EtatAdhesion etat;
   
    @Column(name = "commence_le")
     private Instant commenceLe;
    
    @Column(name = "expire_le")
     private Instant expireLe;
   
    @Column(name = "cree_le", nullable = false)
    private Instant creeLe;

    protected Adhesion() { }
    public Adhesion(Utilisateur utilisateur) {
        this.id = UUID.randomUUID(); this.utilisateur = utilisateur;
        this.etat = EtatAdhesion.EN_ATTENTE_PAIEMENT;
    }
    
    @PrePersist void initialiserDateCreation() { if (creeLe == null) creeLe = Instant.now(); }
    public UUID getId() { return id; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public EtatAdhesion getEtat() { return etat; }
    public Instant getCommenceLe() { return commenceLe; }
    public Instant getExpireLe() { return expireLe; }
    public void activer(Instant debut, Instant fin) {
        this.etat = EtatAdhesion.ACTIVE; this.commenceLe = debut; this.expireLe = fin;
    }
}
