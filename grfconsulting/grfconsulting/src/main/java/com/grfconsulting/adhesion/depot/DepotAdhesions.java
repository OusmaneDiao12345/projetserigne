package com.grfconsulting.adhesion.depot;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.grfconsulting.adhesion.domaine.Adhesion;
import com.grfconsulting.adhesion.domaine.EtatAdhesion;

/** Recherche les adhésions d'un membre et vérifie son droit d'accès à date donnée. */
public interface DepotAdhesions extends JpaRepository<Adhesion, UUID> {
    boolean existsByUtilisateurIdAndEtatAndExpireLeAfter(UUID utilisateurId, EtatAdhesion etat, Instant date);
    List<Adhesion> findByUtilisateurIdOrderByCreeLeDesc(UUID utilisateurId);
    Optional<Adhesion> findFirstByUtilisateurIdAndEtatOrderByCreeLeDesc(UUID utilisateurId, EtatAdhesion etat);
}
