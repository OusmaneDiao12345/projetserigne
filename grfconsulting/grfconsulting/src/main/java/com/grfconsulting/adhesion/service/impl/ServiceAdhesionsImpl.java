package com.grfconsulting.adhesion.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.List;

import com.grfconsulting.adhesion.depot.DepotAdhesions;
import com.grfconsulting.adhesion.domaine.Adhesion;
import com.grfconsulting.adhesion.domaine.EtatAdhesion;
import com.grfconsulting.adhesion.service.ServiceAdhesions;
import com.grfconsulting.authentification.depot.DepotRolesUtilisateur;
import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import com.grfconsulting.authentification.domaine.CodeRole;
import com.grfconsulting.authentification.domaine.EtatCompte;
import com.grfconsulting.authentification.domaine.RoleUtilisateur;
import com.grfconsulting.authentification.domaine.Utilisateur;
import com.grfconsulting.paiement.configuration.ConfigurationPaiement;
import com.grfconsulting.paiement.depot.DepotPaiements;
import com.grfconsulting.paiement.domaine.Paiement;
import com.grfconsulting.paiement.domaine.TypePaiement;
import com.grfconsulting.paiement.dto.ReponseCaissePaiement;
import com.grfconsulting.paiement.service.ServiceCaisseDexpay;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.grfconsulting.commun.exception.RessourceIntrouvableException;

/** Coordonne le cycle annuel d'adhésion et son activation après confirmation financière. */
@Service
public class ServiceAdhesionsImpl implements ServiceAdhesions {
    private static final long TARIF_ANNUEL_FCFA = 5_000;
    private final DepotAdhesions depotAdhesions;
    private final DepotPaiements depotPaiements;
    private final DepotUtilisateurs depotUtilisateurs;
    private final DepotRolesUtilisateur depotRoles;
    private final ServiceCaisseDexpay caisseDexpay;
    private final ConfigurationPaiement configurationPaiement;

    public ServiceAdhesionsImpl(DepotAdhesions depotAdhesions, DepotPaiements depotPaiements,
                                DepotUtilisateurs depotUtilisateurs, DepotRolesUtilisateur depotRoles,
                                ServiceCaisseDexpay caisseDexpay, ConfigurationPaiement configurationPaiement) {
        this.depotAdhesions = depotAdhesions; this.depotPaiements = depotPaiements;
        this.depotUtilisateurs = depotUtilisateurs; this.depotRoles = depotRoles;
        this.caisseDexpay = caisseDexpay; this.configurationPaiement = configurationPaiement;
    }

    @Override
    public ReponseCaissePaiement creerPremiereAdhesion(Utilisateur utilisateur, String operateur) {
        Adhesion adhesion = depotAdhesions.save(new Adhesion(utilisateur));
        return creerPaiementAdhesion(utilisateur, adhesion, operateur);
    }

    @Override
    public ReponseCaissePaiement renouvelerAdhesion(Utilisateur utilisateur, String operateur) {
        Adhesion adhesion = depotAdhesions.save(new Adhesion(utilisateur));
        return creerPaiementAdhesion(utilisateur, adhesion, operateur);
    }

    @Override
    public ReponseCaissePaiement renouvelerAdhesion(UUID utilisateurId, String operateur) {
        Utilisateur utilisateur = depotUtilisateurs.findById(utilisateurId)
                .orElseThrow(() -> new RessourceIntrouvableException("Compte utilisateur introuvable."));
        return renouvelerAdhesion(utilisateur, operateur);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Adhesion> consulterAdhesions(UUID utilisateurId) {
        return depotAdhesions.findByUtilisateurIdOrderByCreeLeDesc(utilisateurId);
    }

    private ReponseCaissePaiement creerPaiementAdhesion(Utilisateur utilisateur, Adhesion adhesion, String operateur) {
        String reference = "GRF-ADH-" + UUID.randomUUID();
        Paiement paiement = depotPaiements.save(new Paiement(reference, utilisateur, adhesion, null,
                TypePaiement.ADHESION, configurationPaiement.getFournisseur(), operateur, TARIF_ANNUEL_FCFA));
        String urlPaiement = caisseDexpay.creerCaisse(reference, "Adhésion annuelle GRF CONSULTING", TARIF_ANNUEL_FCFA);
        paiement.definirUrlPaiement(urlPaiement);
        depotPaiements.save(paiement);
        return new ReponseCaissePaiement(reference, urlPaiement, TARIF_ANNUEL_FCFA, "XOF",
                configurationPaiement.getFournisseur(), "EN_ATTENTE");
    }

    @Override
    @Transactional
    public void activerApresPaiement(Adhesion adhesion) {
        Instant maintenant = Instant.now();
        Instant debut = depotAdhesions.findFirstByUtilisateurIdAndEtatOrderByCreeLeDesc(
                        adhesion.getUtilisateur().getId(), EtatAdhesion.ACTIVE)
                .map(Adhesion::getExpireLe).filter(expiration -> expiration.isAfter(maintenant)).orElse(maintenant);
        adhesion.activer(debut, debut.plus(365, ChronoUnit.DAYS));
        Utilisateur utilisateur = adhesion.getUtilisateur();
        utilisateur.activerCompte();
        depotRoles.findById(CodeRole.MEMBRE).ifPresent(utilisateur::ajouterRole);
        depotUtilisateurs.save(utilisateur);
        depotAdhesions.save(adhesion);
    }
}
