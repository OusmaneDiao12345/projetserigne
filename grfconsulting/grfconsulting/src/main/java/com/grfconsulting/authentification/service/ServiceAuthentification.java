package com.grfconsulting.authentification.service;

import java.util.UUID;

import com.grfconsulting.authentification.dto.DemandeConnexion;
import com.grfconsulting.authentification.dto.DemandeInscription;
import com.grfconsulting.authentification.dto.ProfilUtilisateur;
import com.grfconsulting.authentification.dto.ReponseInscription;
import com.grfconsulting.authentification.dto.ReponseJeton;

public interface ServiceAuthentification {
    ReponseInscription inscrire(DemandeInscription demande);

    ReponseJeton connecter(DemandeConnexion demande);

    ProfilUtilisateur obtenirProfil(UUID utilisateurId);
}
