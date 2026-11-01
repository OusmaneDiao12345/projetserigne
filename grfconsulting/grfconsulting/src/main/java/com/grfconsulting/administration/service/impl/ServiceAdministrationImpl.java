package com.grfconsulting.administration.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.grfconsulting.adhesion.depot.DepotAdhesions;
import com.grfconsulting.adhesion.domaine.EtatAdhesion;
import com.grfconsulting.administration.service.ServiceAdministration;
import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import com.grfconsulting.authentification.domaine.Utilisateur;
import com.grfconsulting.authentification.dto.ProfilUtilisateur;
import com.grfconsulting.commun.exception.RessourceIntrouvableException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regroupe les opérations réservées au rôle administrateur sur les comptes membres. */
@Service
public class ServiceAdministrationImpl implements ServiceAdministration {
    private final DepotUtilisateurs depotUtilisateurs;
    private final DepotAdhesions depotAdhesions;
    public ServiceAdministrationImpl(DepotUtilisateurs depotUtilisateurs, DepotAdhesions depotAdhesions) {
        this.depotUtilisateurs = depotUtilisateurs; this.depotAdhesions = depotAdhesions;
    }
    @Override
    @Transactional(readOnly = true)
    public List<ProfilUtilisateur> listerUtilisateurs() {
        return depotUtilisateurs.findAll().stream().map(utilisateur -> {
            boolean active = depotAdhesions.existsByUtilisateurIdAndEtatAndExpireLeAfter(
                    utilisateur.getId(), EtatAdhesion.ACTIVE, Instant.now());
            Set<String> roles = utilisateur.getRoles().stream().map(role -> role.getCode().name()).collect(Collectors.toSet());
            return new ProfilUtilisateur(utilisateur.getId(), utilisateur.getNomComplet(), utilisateur.getTelephone(),
                    utilisateur.getDateNaissance(), utilisateur.getEtat().name(), roles, active);
        }).toList();
    }
    @Override
    @Transactional
    public void suspendreUtilisateur(UUID utilisateurId) {
        Utilisateur utilisateur = depotUtilisateurs.findById(utilisateurId)
                .orElseThrow(() -> new RessourceIntrouvableException("Compte utilisateur introuvable."));
        utilisateur.suspendreCompte();
        depotUtilisateurs.save(utilisateur);
    }
}
