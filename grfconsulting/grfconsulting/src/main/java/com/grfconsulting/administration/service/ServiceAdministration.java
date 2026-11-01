package com.grfconsulting.administration.service;

import java.util.List;
import java.util.UUID;
import com.grfconsulting.authentification.dto.ProfilUtilisateur;

public interface ServiceAdministration {
    List<ProfilUtilisateur> listerUtilisateurs();
    void suspendreUtilisateur(UUID utilisateurId);
}
