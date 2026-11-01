package com.grfconsulting.paiement.controleur;

import com.grfconsulting.paiement.depot.DepotPaiements;
import com.grfconsulting.paiement.dto.ReponseEtatPaiement;
import com.grfconsulting.commun.exception.RessourceIntrouvableException;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Fournit le seul état utile au navigateur pour achever le retour de caisse sans confiance dans le client. */
@RestController
@RequestMapping("/api/v1/paiements")
public class ControleurConsultationPaiements {
    private final DepotPaiements depotPaiements;
    public ControleurConsultationPaiements(DepotPaiements depotPaiements) { this.depotPaiements = depotPaiements; }

  @GetMapping("/{reference}")
    @Operation(summary = "Vérifier l'état d'une référence de paiement aléatoire après le retour DEXPAY.")
    public ReponseEtatPaiement consulter(@PathVariable String reference) {
        var paiement = depotPaiements.findByReference(reference)
                .orElseThrow(() -> new RessourceIntrouvableException("Référence de paiement inconnue."));
        return new ReponseEtatPaiement(paiement.getReference(), paiement.getEtat().name(), paiement.getType().name(),
                paiement.getMontant(), paiement.getDevise());
    }
}
