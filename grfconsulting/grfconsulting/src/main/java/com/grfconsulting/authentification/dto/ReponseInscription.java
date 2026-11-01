package com.grfconsulting.authentification.dto;

import java.util.UUID;

/** Confirme que le compte est en attente et fournit la caisse à ouvrir pour adhérer. */
public record ReponseInscription(UUID utilisateurId, String referencePaiement, String urlPaiement,
                                 long montant, String devise, String etat) {
}
