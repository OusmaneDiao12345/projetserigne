# GRF Consulting — API Spring Boot

Backend du projet GRF Consulting, organisé en modules métier. Java 17, Spring Boot, PostgreSQL avec pgvector, Flyway et Spring AI (Google Gemini). Les noms des classes et packages métier sont en français ; les noms de champs JSON destinés au frontend restent un contrat d'API indépendant.

## Démarrer

1. Depuis ce dossier, copiez `.env.example` vers `.env` et renseignez les valeurs locales. Le `.env` est ignoré par Git.
2. Démarrez PostgreSQL avec `docker compose up -d postgres`.
3. Lancez l'API avec `mvnw.cmd spring-boot:run` sous Windows (ou `./mvnw spring-boot:run`). Java 17 est requis.
4. Ouvrez Swagger sur `http://localhost:8080/swagger-ui.html` ; le document OpenAPI est sur `/v3/api-docs`.

Pour démarrer l'ensemble dans Docker : `docker compose up --build`. L'API écoute sur le port 8080 et attend que PostgreSQL soit prêt. Les données PostgreSQL sont conservées dans le volume `grf_postgres_data`.

## Parcours exposés

### Inscription membre et connexion

- `POST /api/v1/auth/inscription` : crée le compte et ouvre la caisse DEXPAY de l'adhésion annuelle (5 000 FCFA).
- Après confirmation du paiement par webhook, `POST /api/v1/auth/connexion` avec le téléphone et le mot de passe renvoie le jeton JWT.
- `GET /api/v1/auth/moi` : profil du compte courant, avec `Authorization: Bearer <jeton>`.
- `POST /api/v1/adhesions/renouvellement` et `GET /api/v1/adhesions/moi` : renouvellement et consultation de l'adhésion.

Le compte ne reçoit pas de droits membre avant confirmation serveur du paiement. Une adhésion expire après un an ; les routes membre vérifient son état actif à chaque opération. Le JWT ne remplace donc pas le contrôle de l'adhésion.

### Question rapide d'un visiteur

- `POST /api/v1/questions-rapides/paiements` : crée une caisse de 1 000 FCFA pour une question juridique, sans compte.
- `GET /api/v1/questions-rapides/{referencePaiement}` : consulte le paiement et récupère la réponse après confirmation.

La réponse rapide nécessite le paiement confirmé. Les questions des membres utilisent `POST /api/v1/legal-questions` et `GET /api/v1/legal-questions/{id}` avec JWT et adhésion active.

### Paiement et administration

- `POST /api/v1/paiements/webhook/dexpay` : reçoit les notifications DEXPAY. Le backend vérifie HMAC-SHA256 sur le corps brut avec la clé secrète avant de marquer le paiement réglé ou d'activer l'adhésion.
- `GET /api/v1/paiements/{reference}` : consultation protégée du paiement.
- `GET /api/v1/administration/utilisateurs` et `PATCH /api/v1/administration/utilisateurs/{id}/suspendre` : administration réservée au rôle et aux permissions adéquats.

Le webhook doit être joignable par HTTPS depuis DEXPAY. Pour les essais locaux, placez l'URL publique HTTPS actuelle du tunnel dans `PUBLIC_API_BASE_URL` (sans ajouter `/api` ; le chemin du webhook est ajouté par l'application). Le tunnel éphémère change d'adresse à chaque redémarrage.

## Rôles et permissions

Les rôles sont initialisés par l'application : `VISITEUR`, `MEMBRE` et `ADMINISTRATEUR`. Un visiteur peut créer une question rapide après paiement ; un membre accède à ses propres questions si son adhésion est active ; l'administrateur peut consulter/suspendre des comptes selon ses permissions. Les comptes n'obtiennent jamais un rôle membre simplement en envoyant une requête depuis le navigateur.

Un compte administrateur initial facultatif est créé au démarrage si `ADMIN_BOOTSTRAP_PHONE` et `ADMIN_BOOTSTRAP_PASSWORD` sont renseignés. Utilisez un mot de passe fort, gardez ces variables privées et retirez-les après le bootstrap si votre politique l'exige.

## Configuration privée

Configurez `.env` localement ou les variables d'environnement du déploiement. Les clés DEXPAY et Gemini doivent rester dans le serveur, jamais dans Angular ni dans un dépôt Git.

- `DEXPAY_API_URL` : sandbox par défaut (`https://api-sandbox.dexpay.africa/api/v1`).
- `DEXPAY_API_KEY` et `DEXPAY_API_SECRET` : clés sandbox ; la clé secrète ne sert qu'au backend et à la vérification de signature.
- `PUBLIC_API_BASE_URL` : adresse HTTPS publique requise pour recevoir les webhooks.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` et `POSTGRES_PORT` : base, identifiants PostgreSQL et port local ; les valeurs par défaut sont `grfconsulting`, `root`, `root` et `5434`. Le port `5434` évite le conflit avec un PostgreSQL local ou un autre conteneur sur `5432`. Pour l'API lancée hors Docker, les variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` et `SPRING_DATASOURCE_PASSWORD` peuvent les remplacer.
- `JWT_SECRET` : secret aléatoire robuste d'au moins 32 caractères ; changez la valeur d'exemple avant tout lancement.
- Dans Docker Compose, l'API utilise le nom de service `postgres`. Modifier les variables de connexion ne change pas les identifiants d'un volume PostgreSQL déjà initialisé.
- `AI_ENABLED`, `GEMINI_API_KEY` et `GEMINI_*` : configuration Gemini. L'IA reste désactivée par défaut.

Ne copiez pas une clé `sk_live` dans le frontend ni dans une conversation. Utilisez des secrets distincts pour sandbox et production.

## Organisation du code

Chaque fonctionnalité possède son module sous `src/main/java/com/grfconsulting` :

- `authentification` : inscription, connexion, utilisateurs, rôles, permissions et émission/validation des JWT.
- `adhesion` : période annuelle, activation après paiement et renouvellement.
- `paiement` : caisse DEXPAY, historique, webhook signé et états de paiement.
- `questionrapide` : parcours payant sans compte pour les visiteurs.
- `questionjuridique` : questions privées des membres, recherche documentaire et génération de réponse.
- `administration` : fonctions réservées aux administrateurs.
- `commun` : configuration de sécurité, gestion des erreurs et composants transverses.

Dans les modules métier, `controleur` expose HTTP, `dto` décrit les entrées/sorties, `service` définit les opérations métier, `service.impl` les réalise, `depot` accède aux données, `domaine` contient les entités et états, et `convertisseur` transforme les objets API et domaine quand nécessaire. Gardez les règles métier dans les services ; les contrôleurs ne font que valider les entrées et déléguer.

Les migrations Flyway versionnées sous `src/main/resources/db/migration` sont la source du schéma. Hibernate est en mode `validate` et ne modifie pas la base à la volée.

## IA et corpus juridique

Spring AI fournit l'intégration au modèle de conversation et à pgvector. `AI_ENABLED` reste à `false` tant que les textes officiels n'ont pas été vérifiés, importés et indexés. Le corpus de la Constitution et des autres textes n'est pas fourni dans ce dépôt ; la qualité et les références juridiques ne peuvent pas être garanties avant l'ingestion et la validation de ces documents.

## Vérifications

Lancer les tests avec `mvnw.cmd test`. Les tests n'utilisent pas les clés DEXPAY ni Gemini. Swagger permet ensuite d'explorer les contrats HTTP ; configurez les variables et un webhook public pour vérifier le parcours de paiement de bout en bout.
