package com.grfconsulting.questionjuridique.depot;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grfconsulting.questionjuridique.domaine.QuestionJuridique;

public interface DepotQuestionsJuridiques extends JpaRepository<QuestionJuridique, UUID> {
    java.util.Optional<QuestionJuridique> findByIdAndUtilisateurId(UUID id, UUID utilisateurId);
}
