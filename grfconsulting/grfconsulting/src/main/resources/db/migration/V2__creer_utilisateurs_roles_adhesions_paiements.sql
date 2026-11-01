CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY,
    nom_complet VARCHAR(160) NOT NULL,
    telephone VARCHAR(24) NOT NULL UNIQUE,
    date_naissance DATE NOT NULL,
    mot_de_passe_hash VARCHAR(100) NOT NULL,
    etat VARCHAR(24) NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE roles_utilisateur (
    code VARCHAR(40) PRIMARY KEY
);

CREATE TABLE role_permissions (
    role_code VARCHAR(40) NOT NULL REFERENCES roles_utilisateur(code),
    permission_code VARCHAR(60) NOT NULL,
    PRIMARY KEY (role_code, permission_code)
);

CREATE TABLE utilisateur_roles (
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id),
    role_code VARCHAR(40) NOT NULL REFERENCES roles_utilisateur(code),
    PRIMARY KEY (utilisateur_id, role_code)
);

CREATE TABLE adhesions (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id),
    etat VARCHAR(24) NOT NULL,
    commence_le TIMESTAMP WITH TIME ZONE,
    expire_le TIMESTAMP WITH TIME ZONE,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE questions_invitees (
    id UUID PRIMARY KEY,
    domaine VARCHAR(40) NOT NULL,
    question TEXT NOT NULL,
    reponse TEXT,
    references_textes TEXT,
    etat VARCHAR(24) NOT NULL,
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE paiements (
    id UUID PRIMARY KEY,
    reference VARCHAR(80) NOT NULL UNIQUE,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    adhesion_id UUID REFERENCES adhesions(id),
    question_invitee_id UUID REFERENCES questions_invitees(id),
    type VARCHAR(32) NOT NULL,
    etat VARCHAR(24) NOT NULL,
    fournisseur VARCHAR(24) NOT NULL,
    operateur VARCHAR(32),
    montant BIGINT NOT NULL,
    devise VARCHAR(3) NOT NULL,
    url_paiement TEXT,
    reference_transaction VARCHAR(128),
    cree_le TIMESTAMP WITH TIME ZONE NOT NULL,
    paye_le TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_adhesions_utilisateur_etat ON adhesions (utilisateur_id, etat, expire_le);
CREATE INDEX idx_paiements_utilisateur_cree ON paiements (utilisateur_id, cree_le DESC);
CREATE INDEX idx_questions_invitees_etat ON questions_invitees (etat, cree_le DESC);
