# Guide de Déploiement sur Cloudflare Workers

Ce guide vous accompagne pas à pas pour déployer l'application Transmission Facile sur Cloudflare Workers avec Static Assets.

> **Migration** : Cette application utilise maintenant **Cloudflare Workers** au lieu de Cloudflare Pages. Voir [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) pour les détails.

## 📋 Prérequis

- Un compte Cloudflare (gratuit)
- Un dépôt GitHub avec le code source
- Une clé API Google AI Studio ([obtenir une clé](https://ai.google.dev/))
- (Optionnel) Un nom de domaine géré par Cloudflare

## 🏗️ Architecture de l'Application

L'application utilise une architecture full-stack sécurisée :

```
Frontend (React/Vite) ──> /api/chat ──> Cloudflare Worker ──> Gemini API
                                               (avec clé sécurisée)
```

**Avantages** :
- ✅ La clé API n'est jamais exposée au navigateur
- ✅ Aucun coût de serveur (gratuit jusqu'à 100,000 requêtes/jour)
- ✅ Déploiement automatique à chaque commit via Workers Builds
- ✅ CDN mondial Cloudflare

## 🚀 Étape 1 : Connecter le Dépôt GitHub

1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Dans le menu latéral, cliquez sur **"Workers & Pages"**
3. Cliquez sur **"Create"** puis **"Workers"**
4. Cliquez sur **"Connect to Git"**
5. Autorisez Cloudflare à accéder à votre compte GitHub
6. Sélectionnez le dépôt **`Notaire-As-A-Service`**
7. Cliquez sur **"Begin setup"**

## ⚙️ Étape 2 : Configuration du Build

Configurez les paramètres de build comme suit :

| Paramètre | Valeur |
|-----------|--------|
| **Project name** | `transmission-facile` (ou votre choix) |
| **Production branch** | `main` (ou `master`) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

**⚠️ Important** : La commande `npm run build` compile maintenant :
1. Le frontend React avec Vite
2. Les Pages Functions en Worker avec `wrangler pages functions build --outdir=./dist/_worker.js`

Laissez les autres paramètres par défaut.

## 🔐 Étape 3 : Configurer les Variables d'Environnement (CRITIQUE)

⚠️ **Cette étape est OBLIGATOIRE** pour que l'application fonctionne.

1. Avant de cliquer sur "Save and Deploy", scrollez vers le bas
2. Trouvez la section **"Environment variables"**
3. Cliquez sur **"Add variable"**
4. Configurez les variables suivantes :

### Variable Obligatoire

| Variable | Valeur | Description |
|----------|--------|-------------|
| `GEMINI_API_KEY` | Votre clé API | Clé d'accès à l'API Gemini (obligatoire) |

### Variable Optionnelle (Sécurité CORS)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `ALLOWED_ORIGINS` | `https://votre-domaine.com` | Origines autorisées (séparées par des virgules) |

> 💡 **Obtenir une clé API** : Rendez-vous sur [Google AI Studio](https://ai.google.dev/), créez un projet et générez une clé API.

> 🔒 **CORS en production** : Si vous configurez un domaine personnalisé, il est recommandé d'ajouter `ALLOWED_ORIGINS=https://votre-domaine.com` pour limiter les requêtes cross-origin. Sans cette variable, toutes les origines sont autorisées (`*`).

5. Cliquez sur **"Save"**

## 📦 Étape 4 : Déployer

1. Cliquez sur **"Save and Deploy"**
2. Cloudflare va :
   - Cloner votre dépôt
   - Installer les dépendances (`npm install`)
   - Construire l'application (`npm run build`)
   - Compiler les Pages Functions en Worker
   - Déployer les fichiers statiques et le Worker
3. Attendez quelques minutes (généralement 2-3 minutes)
4. Une fois terminé, vous verrez un lien du type : `https://transmission-facile.workers.dev`

## 🌐 Étape 5 : Configurer un Domaine Personnalisé (Optionnel)

Si vous possédez un nom de domaine chez Cloudflare :

1. Dans votre projet Worker, allez dans l'onglet **"Settings"** > **"Triggers"**
2. Cliquez sur **"Add Custom Domain"**
3. Entrez votre domaine (ex: `notaire-ai.com` ou `app.votredomaine.com`)
4. Cloudflare configurera automatiquement :
   - Les enregistrements DNS
   - Le certificat SSL (HTTPS)
   - La redirection HTTP vers HTTPS

Le domaine sera actif en quelques minutes.

## 🧪 Étape 6 : Tester l'Application

1. Ouvrez l'URL de votre application (`.workers.dev` ou votre domaine personnalisé)
2. Testez le formulaire :
   - Remplissez les informations patrimoniales
   - Soumettez le formulaire
   - Vérifiez que l'analyse IA fonctionne

Si vous obtenez une erreur :
- Vérifiez que `GEMINI_API_KEY` est bien configurée dans les variables d'environnement
- Consultez les logs : **Workers & Pages** > **Votre Projet** > **Logs**

## 🔄 Déploiement Continu

**Automatique** : Chaque fois que vous pushez du code sur GitHub, Cloudflare redéploie automatiquement votre application via Workers Builds.

Pour désactiver le déploiement automatique :
1. **Workers & Pages** > **Votre Projet** > **Settings** > **Builds**
2. Configurez les branches à déployer

## 📊 Monitoring et Logs

### Voir les Logs de Build
1. **Workers & Pages** > **Votre Projet** > **Deployments**
2. Cliquez sur un déploiement
3. Consultez les logs

### Analyser le Trafic
1. **Workers & Pages** > **Votre Projet** > **Analytics**
2. Visualisez les visites, la performance, etc.

### Voir les Erreurs Runtime
Les erreurs du Worker sont visibles dans :
- **Workers & Pages** > **Votre Projet** > **Logs** > **Real-time logs**

## 🛡️ Sécurité

### Bonnes Pratiques Implémentées

✅ **Clé API protégée** : Stockée côté serveur, jamais exposée au client  
✅ **HTTPS automatique** : Tout le trafic est chiffré  
✅ **CORS configuré** : Protection contre les requêtes cross-origin malveillantes  
✅ **Validation des entrées** : Les requêtes sont validées avant traitement  

### Améliorations Futures (Optionnel)

Pour renforcer la sécurité, vous pouvez ajouter :

1. **Rate Limiting** : Limitez les requêtes par IP
   ```typescript
   // Dans functions/api/chat.ts
   // Ajouter une logique de limitation
   ```

2. **Authentification** : Protégez l'accès avec un login
   ```typescript
   // Vérifier un token JWT dans les headers
   ```

3. **Usage Quota** : Limitez le nombre de requêtes par utilisateur

## 🆘 Résolution de Problèmes

### Erreur : "GEMINI_API_KEY not configured"
➡️ **Solution** : Ajoutez la variable d'environnement dans **Settings** > **Variables and Secrets**

### Erreur 500 lors de l'appel API
➡️ **Solution** : Vérifiez que votre clé API Google est valide et active

### Le build échoue
➡️ **Solution** : 
- Vérifiez les logs de build
- Assurez-vous que `npm run build` fonctionne localement
- Vérifiez que toutes les dépendances sont dans `package.json`

### L'application ne charge pas
➡️ **Solution** :
- Vérifiez que le **Build output directory** est bien `dist`
- Inspectez la console du navigateur (F12)

## 📚 Ressources

- [Documentation Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Workers with Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Migration Guide : Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Google AI Studio](https://ai.google.dev/)
- [Support Cloudflare](https://dash.cloudflare.com/support)

## 💰 Limites Gratuites Cloudflare Workers

| Ressource | Limite Gratuite |
|-----------|----------------|
| Requêtes Workers | 100,000/jour |
| Bande passante | Illimitée |
| Temps CPU | 50ms par invocation (gratuit) |
| Stockage KV | 1GB |

Pour un projet personnel ou une PME, ces limites sont largement suffisantes.

---

## Changements depuis Pages

| Aspect | Pages | Workers |
|--------|-------|---------|
| Commande de déploiement | `wrangler pages deploy` | `wrangler deploy` |
| Fichier de config | `wrangler.toml` | `wrangler.jsonc` |
| Compilation des functions | Automatique | `wrangler pages functions build` |
| URL par défaut | `.pages.dev` | `.workers.dev` |
| Dashboard | Pages | Workers & Pages |

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation Cloudflare.
