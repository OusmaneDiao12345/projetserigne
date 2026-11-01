package com.grfconsulting.administration.controleur;

import java.util.List;
import java.util.UUID;

import com.grfconsulting.administration.service.ServiceAdministration;
import com.grfconsulting.authentification.dto.ProfilUtilisateur;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Routes de gestion des comptes réservées aux rôles et permissions d'administration. */
@RestController
@RequestMapping("/api/v1/administration/utilisateurs")
@Tag(name = "Administration")
public class ControleurAdministration {
    private final ServiceAdministration service;
    public ControleurAdministration(ServiceAdministration service) { this.service = service; }

    @GetMapping
    @PreAuthorize("hasAuthority('CONSULTER_UTILISATEURS')")
    @Operation(summary = "Lister les profils membres sans exposer les informations d'authentification.")
    public List<ProfilUtilisateur> lister() { return service.listerUtilisateurs(); }

    @PatchMapping("/{id}/suspendre")
    @PreAuthorize("hasAuthority('GERER_UTILISATEURS')")
    @Operation(summary = "Suspendre l'accès d'un compte membre.")
    public ResponseEntity<Void> suspendre(@PathVariable UUID id) {
        service.suspendreUtilisateur(id);
        return ResponseEntity.noContent().build();
    }
}
