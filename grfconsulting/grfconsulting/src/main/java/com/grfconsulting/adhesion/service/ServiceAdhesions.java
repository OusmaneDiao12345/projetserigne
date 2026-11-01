package com.grfconsulting.adhesion.service;

import com.grfconsulting.adhesion.domaine.Adhesion;
import com.grfconsulting.authentification.domaine.Utilisateur;
import com.grfconsulting.paiement.dto.ReponseCaissePaiement;
import java.util.List;
import java.util.UUID;

public interface ServiceAdhesions {

  ReponseCaissePaiement creerPremiereAdhesion(Utilisateur utilisateur, String operateur);

    ReponseCaissePaiement renouvelerAdhesion(Utilisateur utilisateur, String operateur);

    ReponseCaissePaiement renouvelerAdhesion(UUID utilisateurId, String operateur);

    List<Adhesion> consulterAdhesions(UUID utilisateurId);

    void activerApresPaiement(Adhesion adhesion);
}
