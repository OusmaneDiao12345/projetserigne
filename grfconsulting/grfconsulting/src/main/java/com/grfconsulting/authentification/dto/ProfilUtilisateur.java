package com.grfconsulting.authentification.dto;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
/** Profil affichable côté client, sans mot de passe ni données d'authentification. */
public record ProfilUtilisateur(UUID id, String nomComplet, String telephone, LocalDate dateNaissance,
                                String etatCompte, Set<String> roles, boolean adhesionActive) {
}
