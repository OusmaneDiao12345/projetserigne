package com.grfconsulting.questionrapide.depot;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.grfconsulting.questionrapide.domaine.QuestionInvitee;

/** Stocke les questions rapides payées par des visiteurs sans compte. */
public interface DepotQuestionsInvitees extends JpaRepository<QuestionInvitee, UUID> {
    Optional<QuestionInvitee> findById(UUID id);
}
