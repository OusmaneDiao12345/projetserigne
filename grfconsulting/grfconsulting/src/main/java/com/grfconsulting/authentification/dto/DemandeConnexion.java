package com.grfconsulting.authentification.dto;

import jakarta.validation.constraints.NotBlank;

/** Identifiants utilisés pour obtenir un jeton JWT. */
public record DemandeConnexion(@NotBlank String telephone, @NotBlank String motDePasse) {
}
