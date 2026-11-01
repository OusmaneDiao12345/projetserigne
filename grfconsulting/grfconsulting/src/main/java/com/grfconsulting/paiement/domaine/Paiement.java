package com.grfconsulting.paiement.domaine;

import java.time.Instant;
import java.util.UUID;

import com.grfconsulting.adhesion.domaine.Adhesion;
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

/** Enregistre une intention et le statut confirmé par le prestataire, jamais celui du navigateur. */
@Entity
@Table(name = "paiements")
public class Paiement {
    @Id private UUID id;
    @Column(nullable = false, unique = true, length = 80) private String reference;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "utilisateur_id") private Utilisateur utilisateur;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "adhesion_id") private Adhesion adhesion;
    @Column(name = "question_invitee_id") private UUID questionInviteeId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private TypePaiement type;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private EtatPaiement etat;
    @Column(nullable = false, length = 24) private String fournisseur;
    @Column(length = 32) private String operateur;
    @Column(nullable = false) private long montant;
    @Column(nullable = false, length = 3) private String devise;
    @Column(name = "url_paiement", columnDefinition = "text") private String urlPaiement;
    @Column(name = "reference_transaction", length = 128) private String referenceTransaction;
    @Column(name = "cree_le", nullable = false) private Instant creeLe;
    @Column(name = "paye_le") private Instant payeLe;

    protected Paiement() { }
    public Paiement(String reference, Utilisateur utilisateur, Adhesion adhesion, UUID questionInviteeId,
                    TypePaiement type, String fournisseur, String operateur, long montant) {
        this.id = UUID.randomUUID(); this.reference = reference; this.utilisateur = utilisateur;
        this.adhesion = adhesion; this.questionInviteeId = questionInviteeId; this.type = type;
        this.fournisseur = fournisseur; this.operateur = operateur; this.montant = montant;
        this.devise = "XOF"; this.etat = EtatPaiement.EN_ATTENTE;
    }
    @PrePersist void initialiserDateCreation() { if (creeLe == null) creeLe = Instant.now(); }
    public UUID getId() { return id; }
    public String getReference() { return reference; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public Adhesion getAdhesion() { return adhesion; }
    public UUID getQuestionInviteeId() { return questionInviteeId; }
    public TypePaiement getType() { return type; }
    public EtatPaiement getEtat() { return etat; }
    public long getMontant() { return montant; }
    public String getDevise() { return devise; }
    public void definirUrlPaiement(String url) { this.urlPaiement = url; }
    public void confirmer(String transactionId) {
        if (etat == EtatPaiement.PAYE) return;
        etat = EtatPaiement.PAYE; payeLe = Instant.now(); referenceTransaction = transactionId;
    }
    public void marquerEchoue() { if (etat == EtatPaiement.EN_ATTENTE) etat = EtatPaiement.ECHOUE; }
    public void marquerAnnule() { if (etat == EtatPaiement.EN_ATTENTE) etat = EtatPaiement.ANNULE; }
}
