package com.grfconsulting.authentification.service;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

import com.grfconsulting.authentification.dto.ReponseJeton;
import com.grfconsulting.authentification.domaine.RoleUtilisateur;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Émet des jetons JWT courts qui transportent l'identité, les rôles et les permissions de l'utilisateur. */
@Service
public class ServiceJetonsJwt {
    private final JwtEncoder encodeur;
    private final long dureeMinutes;
    public ServiceJetonsJwt(JwtEncoder encodeur, @Value("${app.securite.jwt-duration-minutes}") long dureeMinutes) {
        this.encodeur = encodeur; this.dureeMinutes = dureeMinutes;
    }
    public ReponseJeton creerJeton(com.grfconsulting.authentification.domaine.Utilisateur utilisateur) {
        Instant maintenant = Instant.now();
        Set<String> roles = utilisateur.getRoles().stream().map(role -> role.getCode().name()).collect(Collectors.toSet());
        Set<String> permissions = utilisateur.getRoles().stream().map(RoleUtilisateur::getPermissions)
                .flatMap(Set::stream).map(Enum::name).collect(Collectors.toSet());
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("grf-consulting-api")
                .issuedAt(maintenant).expiresAt(maintenant.plusSeconds(dureeMinutes * 60))
                .subject(utilisateur.getId().toString()).claim("telephone", utilisateur.getTelephone())
                .claim("roles", roles).claim("permissions", permissions).build();
        String jwt = encodeur.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new ReponseJeton(jwt, "Bearer", dureeMinutes * 60, roles, permissions);
    }
}
