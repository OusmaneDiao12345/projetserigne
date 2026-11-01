package com.grfconsulting.questionrapide.dto;

import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Question d'un visiteur et opérateur préféré pour le paiement unitaire. */
public record DemandeQuestionInvitee(@NotNull DomaineJuridique domaine,
        @NotBlank @Size(min = 10, max = 3000) String question,
        @NotBlank String operateur) { }
