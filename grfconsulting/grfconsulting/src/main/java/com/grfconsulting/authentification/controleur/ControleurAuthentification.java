package com.grfconsulting.authentification.controleur;

import java.util.UUID;

import com.grfconsulting.authentification.dto.DemandeConnexion;
import com.grfconsulting.authentification.dto.DemandeInscription;
import com.grfconsulting.authentification.dto.ProfilUtilisateur;
import com.grfconsulting.authentification.dto.ReponseInscription;
import com.grfconsulting.authentification.dto.ReponseJeton;
import com.grfconsulting.authentification.service.ServiceAuthentification;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Expose l'inscription payante, la connexion JWT et le profil du compte connecté. */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentification")
public class ControleurAuthentification {
    private final ServiceAuthentification serviceAuthentification;
    public ControleurAuthentification(ServiceAuthentification serviceAuthentification) {
        this.serviceAuthentification = serviceAuthentification;
    }

    @PostMapping("/inscription")
    @Operation(summary = "Créer un compte et ouvrir la caisse d'adhésion annuelle (5 000 FCFA).")
    public ResponseEntity<ReponseInscription> inscrire(@Valid @RequestBody DemandeInscription demande) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceAuthentification.inscrire(demande));
    }

    @PostMapping("/connexion")
    @Operation(summary = "Obtenir un jeton JWT pour un compte avec adhésion active.")
    public ResponseEntity<ReponseJeton> connecter(@Valid @RequestBody DemandeConnexion demande) {
        return ResponseEntity.ok(serviceAuthentification.connecter(demande));
    }

    @GetMapping("/moi")
    @Operation(summary = "Lire le profil du compte identifié par le JWT.")
    public ResponseEntity<ProfilUtilisateur> obtenirProfil(@AuthenticationPrincipal Jwt jeton) {
        return ResponseEntity.ok(serviceAuthentification.obtenirProfil(UUID.fromString(jeton.getSubject())));
    }
}
