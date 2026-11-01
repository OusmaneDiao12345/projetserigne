package com.grfconsulting.questionrapide.domaine;

import java.time.Instant;
import java.util.UUID;

import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Question d'un visiteur sans compte, disponible uniquement après confirmation du paiement unitaire. */
@Entity
@Table(name = "questions_invitees")
public class QuestionInvitee {
    @Id private UUID id;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40) private DomaineJuridique domaine;
    @Column(nullable = false, columnDefinition = "text") private String question;
    @Column(columnDefinition = "text") private String reponse;
    @Column(name = "references_textes", columnDefinition = "text") private String referencesTextes;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private EtatQuestionInvitee etat;
    @Column(name = "cree_le", nullable = false) private Instant creeLe;

    protected QuestionInvitee() { }
    public QuestionInvitee(DomaineJuridique domaine, String question) {
        this.id = UUID.randomUUID(); this.domaine = domaine; this.question = question;
        this.etat = EtatQuestionInvitee.EN_ATTENTE_PAIEMENT;
    }
    @PrePersist void initialiserDateCreation() { if (creeLe == null) creeLe = Instant.now(); }
    public UUID getId() { return id; }
    public DomaineJuridique getDomaine() { return domaine; }
    public String getQuestion() { return question; }
    public String getReponse() { return reponse; }
    public String getReferencesTextes() { return referencesTextes; }
    public EtatQuestionInvitee getEtat() { return etat; }
    public void confirmerPaiement() { if (etat == EtatQuestionInvitee.EN_ATTENTE_PAIEMENT) etat = EtatQuestionInvitee.PAYEE; }
    public void commencerTraitement() { etat = EtatQuestionInvitee.TRAITEMENT_EN_COURS; }
    public void enregistrerReponse(String reponse, String references) {
        this.reponse = reponse; this.referencesTextes = references; this.etat = EtatQuestionInvitee.REPONDUE;
    }
    public void echouerTraitement() { this.etat = EtatQuestionInvitee.ECHEC_TRAITEMENT; }
}
