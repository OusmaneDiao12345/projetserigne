package com.grfconsulting.paiement.dto;

public record ReponseEtatPaiement(String referencePaiement, String etat, String type, long montant,
                                  String devise) { }
