package com.grfconsulting.questionjuridique.dto;

import java.time.Instant;
import java.util.UUID;

import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;

public record ReponseQuestionJuridique(UUID id, DomaineJuridique domain, String question, String answer,
                                    String sourceReferences, Instant createdAt) {
}
