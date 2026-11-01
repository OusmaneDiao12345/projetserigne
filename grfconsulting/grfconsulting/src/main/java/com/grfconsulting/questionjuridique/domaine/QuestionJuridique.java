package com.grfconsulting.questionjuridique.domaine;

import java.time.Instant;
import java.util.UUID;

import com.grfconsulting.authentification.domaine.Utilisateur;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "legal_questions")
public class QuestionJuridique {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DomaineJuridique domain;

    @Column(nullable = false, columnDefinition = "text")
    private String question;

    @Column(nullable = false, columnDefinition = "text")
    private String answer;

    @Column(name = "source_references", nullable = false, columnDefinition = "text")
    private String sourceReferences = "";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Version
    @Column(nullable = false)
    private long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur utilisateur;

    protected QuestionJuridique() {
    }

    public QuestionJuridique(DomaineJuridique domain, String question, String answer, String sourceReferences, Utilisateur utilisateur) {
        this.id = UUID.randomUUID();
        this.domain = domain;
        this.question = question;
        this.answer = answer;
        this.sourceReferences = sourceReferences == null ? "" : sourceReferences;
        this.utilisateur = utilisateur;
    }

    public void completeAnswer(String answer, String sourceReferences) {
        this.answer = answer;
        this.sourceReferences = sourceReferences == null ? "" : sourceReferences;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public DomaineJuridique getDomain() { return domain; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public String getSourceReferences() { return sourceReferences; }
    public Instant getCreatedAt() { return createdAt; }
    public Utilisateur getUtilisateur() { return utilisateur; }
}
