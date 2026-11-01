package com.grfconsulting.questionjuridique.dto;

import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DemandeQuestionJuridique(
        @NotNull(message = "Le domaine juridique est obligatoire.") DomaineJuridique domain,
        @NotBlank(message = "La question est obligatoire.")
        @Size(max = 8000, message = "La question ne peut pas dépasser 8 000 caractères.") String question) {
}
