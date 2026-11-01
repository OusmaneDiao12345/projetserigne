package com.grfconsulting.adhesion.controleur;

import java.util.List;
import java.util.UUID;

import com.grfconsulting.adhesion.dto.DemandeRenouvellementAdhesion;
import com.grfconsulting.adhesion.dto.ReponseAdhesion;
import com.grfconsulting.adhesion.service.ServiceAdhesions;
import com.grfconsulting.paiement.dto.ReponseCaissePaiement;
import com.grfconsulting.paiement.shared.ServiceNormalisationOperateur;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Permet au membre authentifié de renouveler son adhésion et consulter ses dates de validité. */
@RestController
@RequestMapping("/api/v1/adhesions")
@Tag(name = "Adhésions")
public class ControleurAdhesions {
    private final ServiceAdhesions service;
    public ControleurAdhesions(ServiceAdhesions service) { this.service = service; }

    @PostMapping("/renouvellement")
    @Operation(summary = "Créer une caisse DEXPAY de renouvellement d'adhésion à 5 000 FCFA.")
    public ReponseCaissePaiement renouveler(@AuthenticationPrincipal Jwt jeton,
            @Valid @RequestBody DemandeRenouvellementAdhesion demande) {
        return service.renouvelerAdhesion(UUID.fromString(jeton.getSubject()),
                ServiceNormalisationOperateur.normaliser(demande.operateur()));
    }

    @GetMapping("/moi")
    @Operation(summary = "Consulter l'historique de ses adhésions et dates d'expiration.")
    public List<ReponseAdhesion> consulter(@AuthenticationPrincipal Jwt jeton) {
        return service.consulterAdhesions(UUID.fromString(jeton.getSubject())).stream()
                .map(adhesion -> new ReponseAdhesion(adhesion.getId(), adhesion.getEtat().name(),
                        adhesion.getCommenceLe(), adhesion.getExpireLe())).toList();
    }
}
