package com.grfconsulting.paiement.dto;

public record ReponseCaissePaiement(String referencePaiement, String urlPaiement, long montant, String devise,
                                    String fournisseur, String etat) {
}
