# GRF CONSULTING

Plateforme Angular d'orientation juridique au Sénégal avec site public, adhésion membre, soumission de dossiers, espace client et administration.

## Parcours membre

1. Le client s'inscrit avec son nom complet, son téléphone, sa date de naissance, son e-mail et un mot de passe.
2. Il règle l'adhésion de **5 000 FCFA** via la page de paiement DEXPAY.
3. Après confirmation du fournisseur, il est automatiquement envoyé dans son espace membre.
4. Depuis son espace, le membre actif peut poser ses questions incluses dans son adhésion annuelle. Les visiteurs peuvent acheter une réponse rapide pour **1 000 FCFA**, sans créer de compte.

Le checkout DEXPAY permet au client de choisir un moyen de paiement mobile disponible au Sénégal.

## Démarrage local

```bash
npm install
npm start
```

`npm start` vérifie le serveur de paiement, le démarre sur le port `4000` si nécessaire, puis lance Angular sur `http://localhost:4200`. Le proxy `/api` est configuré automatiquement. Le mode `demo` est utilisé par défaut et ne déclenche aucun débit réel. Pour lancer l'API seule, utilisez `npm run start:api`.

## Configurer DEXPAY en sandbox

Copiez `.env.example` vers `.env`, puis renseignez les clés sandbox depuis le portail DEXPAY. La configuration reste côté serveur :

```env
PAYMENTS_MODE=dexpay
DEXPAY_API_URL=https://api-sandbox.dexpay.africa/api/v1
DEXPAY_API_KEY=pk_test_...
DEXPAY_API_SECRET=sk_test_...
APP_URL=https://votre-domaine.sn
APP_ORIGIN=https://votre-domaine.sn
PUBLIC_API_URL=https://api.votre-domaine.sn/api
```

Redémarrez le serveur après configuration. `APP_URL` et `PUBLIC_API_URL` doivent être des URLs HTTPS accessibles depuis Internet pour les retours client et les webhooks. En développement local, utilisez un tunnel HTTPS vers l'application/API. Le serveur crée une session hébergée et n'active l'accès qu'après réception d'un webhook signé HMAC-SHA256. Le navigateur ne peut pas déclarer lui-même un paiement réussi. La disponibilité d'un paiement sandbox dépend aussi de l'accès aux opérateurs de test DEXPAY.

Les clés secrètes envoyées dans une conversation ou dans un dépôt doivent être révoquées puis renouvelées. Ne copiez pas ces anciennes clés dans `.env`, Angular ou Git.

## Organisation

```text
src/app/core       modèles, services métier, accès et adaptateur paiement
src/app/features   pages publiques, inscription, paiement, espace membre et administration
src/app/shared     navigation, mises en page et composants communs
server             API de paiement, checkout DEXPAY et webhook signé
```

## Comptes de démonstration

- Administration : `admin@grfconsulting.sn` / `Admin@2026`
- Les clients peuvent créer un compte depuis **Inscription**.

La version actuelle conserve encore comptes, dossiers et références dans le navigateur et les sessions de paiement en mémoire côté serveur. Il faut les remplacer par une base de données et une authentification serveur avant d'utiliser l'application avec de vrais membres ou d'exploiter des paiements réels.

## Documentation paiement

Les paiements réels restent désactivés tant que le compte marchand, les URLs HTTPS publiques et les clés de production DEXPAY ne sont pas configurés et validés. Ne partagez jamais les clés secrètes.

# grf_consulting
# Réponse rapide juridique par IA

Le serveur expose `POST /api/legal/answer`. Il vérifie d’abord qu’une réponse rapide (`ia`) est payée ou qu’une référence d’adhésion payée encore valide est fournie, puis sélectionne des passages du corpus constitutionnel local et les transmet au fournisseur IA configuré. L’IA doit citer les articles reçus et signaler quand la Constitution ne suffit pas.

Pour activer le fournisseur, copiez `.env.example` vers `.env` si nécessaire, puis renseignez `AI_API_KEY` et `AI_MODEL`. `AI_API_URL` accepte une API compatible avec le format Chat Completions (par défaut OpenAI). La clé reste dans `.env` côté serveur et ne doit jamais être placée dans Angular. Sans ces variables, le serveur renvoie une erreur explicite `503`; aucune réponse juridique fictive n’est affichée.

Le corpus initial est dans `server/knowledge/constitution-sn.js`. Il s’agit d’un corpus de passages sélectionnés, pas d’un recueil complet. Il s’appuie sur le texte publié par le Conseil constitutionnel et prend en compte la révision constitutionnelle n° 2024-15 publiée au Journal officiel n° 7791. Les révisions constitutionnelles de 2026 doivent être vérifiées avant toute mise à jour du corpus : la loi n° 18/2026 a été invalidée par la décision n° 6/C/2026 et la proposition n° 33/2026 était encore annoncée comme soumise à référendum à la date de vérification. Les références et dates sont listées dans le fichier du corpus.

Le corpus et les réponses de l’IA sont une aide d’orientation, pas un avis juridique professionnel. La Constitution ne suffit pas à trancher les questions qui dépendent d’un code ou d’une loi particulière.
