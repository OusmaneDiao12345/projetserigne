package com.grfconsulting.authentification.domaine;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur implements UserDetails {

    @Id
    private UUID id;

    @Column(name = "nom_complet", nullable = false, length = 160)
    private String nomComplet;

    @Column(nullable = false, unique = true, length = 24)
    private String telephone;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Column(name = "mot_de_passe_hash", nullable = false, length = 100)
    private String motDePasseHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private EtatCompte etat;

    @Column(name = "cree_le", nullable = false)
    private Instant creeLe;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "utilisateur_roles", joinColumns = @JoinColumn(name = "utilisateur_id"),
            inverseJoinColumns = @JoinColumn(name = "role_code", referencedColumnName = "code"))
    private Set<RoleUtilisateur> roles = new HashSet<>();

    protected Utilisateur() {
    }

    public Utilisateur(String nomComplet, String telephone, LocalDate dateNaissance, String motDePasseHash) {
        this.id = UUID.randomUUID();
        this.nomComplet = nomComplet;
        this.telephone = telephone;
        this.dateNaissance = dateNaissance;
        this.motDePasseHash = motDePasseHash;
        this.etat = EtatCompte.EN_ATTENTE_PAIEMENT;
    }

    @PrePersist
    void initialiserDateCreation() {
        if (creeLe == null) creeLe = Instant.now();
    }

    public UUID getId() { return id; }
    public String getNomComplet() { return nomComplet; }
    public String getTelephone() { return telephone; }
    public LocalDate getDateNaissance() { return dateNaissance; }
    public EtatCompte getEtat() { return etat; }
    public Set<RoleUtilisateur> getRoles() { return Set.copyOf(roles); }
    public void activerCompte() { this.etat = EtatCompte.ACTIF; }
    public void suspendreCompte() { this.etat = EtatCompte.SUSPENDU; }
    public void ajouterRole(RoleUtilisateur role) { this.roles.add(role); }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        for (RoleUtilisateur role : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getCode().name()));
            role.getPermissions().forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission.name())));
        }
        return authorities;
    }
    @Override public String getPassword() { return motDePasseHash; }
    @Override public String getUsername() { return telephone; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return etat != EtatCompte.SUSPENDU; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return etat == EtatCompte.ACTIF; }
}
