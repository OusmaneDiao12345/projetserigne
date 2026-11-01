package com.grfconsulting.questionjuridique.service;

import java.util.UUID;

import com.grfconsulting.questionjuridique.dto.DemandeQuestionJuridique;
import com.grfconsulting.questionjuridique.dto.ReponseQuestionJuridique;

public interface ServiceQuestionsJuridiques {
    ReponseQuestionJuridique ask(DemandeQuestionJuridique request, UUID utilisateurId);
    ReponseQuestionJuridique getById(UUID id, UUID utilisateurId);
}
