package com.grfconsulting.questionrapide.service;

import com.grfconsulting.questionrapide.dto.DemandeQuestionInvitee;
import com.grfconsulting.questionrapide.dto.ReponseQuestionInvitee;
import com.grfconsulting.questionrapide.dto.ReponseSoumissionInvitee;

public interface ServiceQuestionsInvitees {
    ReponseSoumissionInvitee soumettre(DemandeQuestionInvitee demande);
    ReponseQuestionInvitee obtenirResultat(String referencePaiement);
}
