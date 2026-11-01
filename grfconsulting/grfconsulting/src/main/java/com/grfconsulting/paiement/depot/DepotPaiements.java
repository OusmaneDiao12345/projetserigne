package com.grfconsulting.paiement.depot;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.grfconsulting.paiement.domaine.Paiement;

/** Recherche une intention DEXPAY par sa référence interne idempotente. */
public interface DepotPaiements extends JpaRepository<Paiement, UUID> {
    Optional<Paiement> findByReference(String reference);
}
