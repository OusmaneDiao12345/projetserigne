package com.grfconsulting.authentification.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Données d'inscription, sans état de rôle ni statut de paiement contrôlable par le navigateur. */
public record DemandeInscription(
        @NotBlank @Size(min = 3, max = 160) String nomComplet,
        @NotBlank @Pattern(regexp = "^\\+?[0-9 .()-]{9,20}$", message = "Indiquez un numéro de téléphone valide.") String telephone,
        @NotNull @Past LocalDate dateNaissance,
        @NotBlank @Size(min = 10, max = 72, message = "Le mot de passe doit contenir entre 10 et 72 caractères.") String motDePasse,
        @NotBlank String operateur) {
}
