package com.grfconsulting.paiement.service;

/** Contrat du client serveur qui crée une caisse hébergée chez DEXPAY. */
public interface ServiceCaisseDexpay {
    String creerCaisse(String reference, String article, long montant);
}
