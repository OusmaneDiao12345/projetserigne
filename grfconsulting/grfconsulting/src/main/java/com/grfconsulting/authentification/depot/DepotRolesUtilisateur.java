package com.grfconsulting.authentification.depot;

import org.springframework.data.jpa.repository.JpaRepository;
import com.grfconsulting.authentification.domaine.CodeRole;
import com.grfconsulting.authentification.domaine.RoleUtilisateur;

/** Charge et crée les rôles qui regroupent les permissions du compte. */
public interface DepotRolesUtilisateur extends JpaRepository<RoleUtilisateur, CodeRole> {
}
