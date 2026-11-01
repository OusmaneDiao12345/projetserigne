package com.grfconsulting.authentification.service.impl;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.grfconsulting.adhesion.depot.DepotAdhesions;
import com.grfconsulting.adhesion.domaine.EtatAdhesion;
import com.grfconsulting.adhesion.service.ServiceAdhesions;
import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import com.grfconsulting.authentification.domaine.Utilisateur;
import com.grfconsulting.authentification.dto.DemandeConnexion;
import com.grfconsulting.authentification.dto.DemandeInscription;
import com.grfconsulting.authentification.dto.ProfilUtilisateur;
import com.grfconsulting.authentification.dto.ReponseInscription;
import com.grfconsulting.authentification.dto.ReponseJeton;
import com.grfconsulting.authentification.service.ServiceAuthentification;
import com.grfconsulting.authentification.service.ServiceJetonsJwt;
import com.grfconsulting.paiement.shared.ServiceNormalisationOperateur;
import com.grfconsulting.commun.exception.ConflitMetierException;
import com.grfconsulting.commun.exception.RessourceIntrouvableException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Applique les règles d'inscription payante, de connexion et de lecture du profil membre. */
@Service
public class ServiceAuthentificationImpl implements ServiceAuthentification {
    private final DepotUtilisateurs depotUtilisateurs;
    private final DepotAdhesions depotAdhesions;
    private final ServiceAdhesions serviceAdhesions;
    private final PasswordEncoder encodeurMotDePasse;
    private final AuthenticationManager gestionnaireAuthentification;
    private final ServiceJetonsJwt serviceJetonsJwt;

    public ServiceAuthentificationImpl(DepotUtilisateurs depotUtilisateurs, DepotAdhesions depotAdhesions,
            ServiceAdhesions serviceAdhesions, PasswordEncoder encodeurMotDePasse,
            AuthenticationManager gestionnaireAuthentification, ServiceJetonsJwt serviceJetonsJwt) {
        this.depotUtilisateurs = depotUtilisateurs; this.depotAdhesions = depotAdhesions;
        this.serviceAdhesions = serviceAdhesions; this.encodeurMotDePasse = encodeurMotDePasse;
        this.gestionnaireAuthentification = gestionnaireAuthentification; this.serviceJetonsJwt = serviceJetonsJwt;
    }

    @Override
    @Transactional
    public ReponseInscription inscrire(DemandeInscription demande) {
        String telephone = normaliserTelephone(demande.telephone());
        if (depotUtilisateurs.existsByTelephone(telephone)) {
            throw new ConflitMetierException("Un compte existe déjà pour ce numéro de téléphone.");
        }
        Utilisateur utilisateur = depotUtilisateurs.save(new Utilisateur(demande.nomComplet().trim(), telephone,
                demande.dateNaissance(), encodeurMotDePasse.encode(demande.motDePasse())));
        var caisse = serviceAdhesions.creerPremiereAdhesion(utilisateur, normaliserOperateur(demande.operateur()));
        return new ReponseInscription(utilisateur.getId(), caisse.referencePaiement(), caisse.urlPaiement(),
                caisse.montant(), caisse.devise(), caisse.etat());
    }

    @Override
    @Transactional(readOnly = true)
    public ReponseJeton connecter(DemandeConnexion demande) {
        String telephone = normaliserTelephone(demande.telephone());
        Authentication authentication = gestionnaireAuthentification.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(telephone, demande.motDePasse()));
        Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();
        boolean adhesionActive = depotAdhesions.existsByUtilisateurIdAndEtatAndExpireLeAfter(
                utilisateur.getId(), EtatAdhesion.ACTIVE, Instant.now());
        boolean administrateur = utilisateur.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMINISTRATEUR"));
        if (!adhesionActive && !administrateur) throw new ConflitMetierException("Une adhésion active est nécessaire pour ouvrir l'espace membre.");
        return serviceJetonsJwt.creerJeton(utilisateur);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfilUtilisateur obtenirProfil(UUID utilisateurId) {
        Utilisateur utilisateur = depotUtilisateurs.findById(utilisateurId)
                .orElseThrow(() -> new RessourceIntrouvableException("Compte utilisateur introuvable."));
        boolean active = depotAdhesions.existsByUtilisateurIdAndEtatAndExpireLeAfter(
                utilisateurId, EtatAdhesion.ACTIVE, Instant.now());
        Set<String> roles = utilisateur.getRoles().stream().map(role -> role.getCode().name()).collect(Collectors.toSet());
        return new ProfilUtilisateur(utilisateur.getId(), utilisateur.getNomComplet(), utilisateur.getTelephone(),
                utilisateur.getDateNaissance(), utilisateur.getEtat().name(), roles, active);
    }

    private String normaliserTelephone(String telephone) {
        String chiffres = telephone.replaceAll("\\D", "");
        if (chiffres.length() == 9) return "+221" + chiffres;
        if (chiffres.startsWith("221")) return "+" + chiffres;
        return "+" + chiffres;
    }

    private String normaliserOperateur(String operateur) { return ServiceNormalisationOperateur.normaliser(operateur); }
}
