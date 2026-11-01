package com.grfconsulting.authentification.service;

import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Retrouve les comptes via leur numéro de téléphone pour la validation du mot de passe. */
@Service
public class ServiceDetailsUtilisateur implements UserDetailsService {
    private final DepotUtilisateurs depotUtilisateurs;
    public ServiceDetailsUtilisateur(DepotUtilisateurs depotUtilisateurs) { this.depotUtilisateurs = depotUtilisateurs; }
    @Override public UserDetails loadUserByUsername(String telephone) throws UsernameNotFoundException {
        return depotUtilisateurs.findByTelephone(telephone)
                .orElseThrow(() -> new UsernameNotFoundException("Identifiants incorrects."));
    }
}
