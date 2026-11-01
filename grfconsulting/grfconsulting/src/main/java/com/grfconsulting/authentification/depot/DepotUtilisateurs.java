package com.grfconsulting.authentification.depot;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.grfconsulting.authentification.domaine.Utilisateur;

/** Accède aux comptes en base et recherche un compte par son identifiant de connexion téléphonique. */
public interface DepotUtilisateurs extends JpaRepository<Utilisateur, UUID> {
    Optional<Utilisateur> findByTelephone(String telephone);
    boolean existsByTelephone(String telephone);
}
