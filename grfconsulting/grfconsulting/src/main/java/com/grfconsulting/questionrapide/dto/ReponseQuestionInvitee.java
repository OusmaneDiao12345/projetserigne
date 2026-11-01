package com.grfconsulting.questionrapide.dto;

import java.util.UUID;

public record ReponseQuestionInvitee(UUID id, String etat, String reponse, String referencesTextes,
                                     String message) { }
