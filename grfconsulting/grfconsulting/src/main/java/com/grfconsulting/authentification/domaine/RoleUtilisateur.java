package com.grfconsulting.authentification.domaine;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles_utilisateur")
public class RoleUtilisateur {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "code", length = 40)
    private CodeRole code;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_code", referencedColumnName = "code"))
    @Column(name = "permission_code", nullable = false, length = 60)
    @Enumerated(EnumType.STRING)
    private Set<PermissionUtilisateur> permissions = new HashSet<>();

    protected RoleUtilisateur() {
    }

    public RoleUtilisateur(CodeRole code, Set<PermissionUtilisateur> permissions) {
        this.code = code;
        this.permissions = new HashSet<>(permissions);
    }

    public CodeRole getCode() { return code; }
    public Set<PermissionUtilisateur> getPermissions() { return Set.copyOf(permissions); }
}
