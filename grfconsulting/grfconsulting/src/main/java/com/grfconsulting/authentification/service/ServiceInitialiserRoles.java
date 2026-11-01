package com.grfconsulting.authentification.service;

import java.util.EnumSet;
import java.util.Set;

import com.grfconsulting.authentification.depot.DepotRolesUtilisateur;
import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import com.grfconsulting.authentification.domaine.CodeRole;
import com.grfconsulting.authentification.domaine.EtatCompte;
import com.grfconsulting.authentification.domaine.PermissionUtilisateur;
import com.grfconsulting.authentification.domaine.RoleUtilisateur;
import com.grfconsulting.authentification.domaine.Utilisateur;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Crée les rôles standards au premier démarrage et un administrateur seulement si l'environnement le demande. */
@Component
public class ServiceInitialiserRoles implements ApplicationRunner {
    private final DepotRolesUtilisateur depotRoles;
    private final DepotUtilisateurs depotUtilisateurs;
    private final PasswordEncoder encodeur;
    private final String telephoneAdmin;
    private final String motDePasseAdmin;

    public ServiceInitialiserRoles(DepotRolesUtilisateur depotRoles, DepotUtilisateurs depotUtilisateurs,
            PasswordEncoder encodeur, @Value("${app.administration.telephone-initial:}") String telephoneAdmin,
            @Value("${app.administration.mot-de-passe-initial:}") String motDePasseAdmin) {
        this.depotRoles = depotRoles; this.depotUtilisateurs = depotUtilisateurs; this.encodeur = encodeur;
        this.telephoneAdmin = telephoneAdmin; this.motDePasseAdmin = motDePasseAdmin;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        RoleUtilisateur membre = depotRoles.findById(CodeRole.MEMBRE).orElseGet(() -> depotRoles.save(
                new RoleUtilisateur(CodeRole.MEMBRE, EnumSet.of(PermissionUtilisateur.POSER_QUESTION,
                        PermissionUtilisateur.CONSULTER_HISTORIQUE, PermissionUtilisateur.TELECHARGER_CARTE))));
        depotRoles.findById(CodeRole.ADMINISTRATEUR).orElseGet(() -> depotRoles.save(new RoleUtilisateur(
                CodeRole.ADMINISTRATEUR, EnumSet.allOf(PermissionUtilisateur.class))));
        if (telephoneAdmin == null || telephoneAdmin.isBlank() || motDePasseAdmin == null || motDePasseAdmin.length() < 12) return;
        depotUtilisateurs.findByTelephone(telephoneAdmin).orElseGet(() -> {
            Utilisateur admin = new Utilisateur("Administrateur GRF", telephoneAdmin,
                    java.time.LocalDate.of(1990, 1, 1), encodeur.encode(motDePasseAdmin));
            admin.activerCompte(); admin.ajouterRole(depotRoles.getReferenceById(CodeRole.ADMINISTRATEUR));
            return depotUtilisateurs.save(admin);
        });
    }
}
