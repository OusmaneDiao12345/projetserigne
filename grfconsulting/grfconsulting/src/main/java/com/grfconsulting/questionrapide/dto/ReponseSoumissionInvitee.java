package com.grfconsulting.questionrapide.dto;

public record ReponseSoumissionInvitee(String referencePaiement, String urlPaiement, long montant,
                                       String devise, String etat) { }
