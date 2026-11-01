package com.grfconsulting.authentification.dto;

import java.util.Set;

/** Réponse d'authentification : jeton Bearer, durée, rôles et permissions du compte. */
public record ReponseJeton(String jetonAcces, String type, long expireDansSecondes,
                           Set<String> roles, Set<String> permissions) { }
