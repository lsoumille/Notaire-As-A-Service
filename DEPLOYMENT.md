# Guide de Déploiement sur Cloudflare Pages

Ce guide vous accompagne pas à pas pour déployer l'application Transmission Facile sur Cloudflare Pages.

## 📋 Prérequis

- Un compte Cloudflare (gratuit)
- Un dépôt GitHub avec le code source
- Une clé API Google AI Studio ([obtenir une clé](https://ai.google.dev/))
- (Optionnel) Un nom de domaine géré par Cloudflare

## 🏗️ Architecture de l'Application

L'application utilise une architecture full-stack sécurisée :

```
Frontend (React/Vite) ──> /api/chat ──> Cloudflare Pages Function ──> Gemini API
                                              (avec clé sécurisée)
```

**Avantages** :
- ✅ La clé API n'est jamais exposée au navigateur
- ✅ Aucun coût de serveur (gratuit jusqu'à 100,000 requêtes/jour)
- ✅ Déploiement automatique à chaque commit
- ✅ CDN mondial Cloudflare

## 🚀 Étape 1 : Connecter le Dépôt GitHub

1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Dans le menu latéral, cliquez sur **"Pages"**
3. Cliquez sur **"Create a project"** puis **"Connect to Git"**
4. Autorisez Cloudflare à accéder à votre compte GitHub
5. Sélectionnez le dépôt **`Notaire-As-A-Service`**
6. Cliquez sur **"Begin setup"**

## ⚙️ Étape 2 : Configuration du Build

Configurez les paramètres de build comme suit :

| Paramètre | Valeur |
|-----------|--------|
| **Project name** | `notaire-as-a-service` (ou votre choix) |
| **Production branch** | `main` (ou `master`) |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

Laissez les autres paramètres par défaut.

## 🔐 Étape 3 : Configurer les Variables d'Environnement (CRITIQUE)

⚠️ **Cette étape est OBLIGATOIRE** pour que l'application fonctionne.

1. Avant de cliquer sur "Save and Deploy", scrollez vers le bas
2. Trouvez la section **"Environment variables"**
3. Cliquez sur **"Add variable"**
4. Configurez :
   - **Variable name** : `GEMINI_API_KEY`
   - **Value** : Collez votre clé API Google AI Studio
   - **Environment** : Sélectionnez `Production` (et `Preview` si souhaité)
5. Cliquez sur **"Save"**

> 💡 **Obtenir une clé API** : Rendez-vous sur [Google AI Studio](https://ai.google.dev/), créez un projet et générez une clé API.

## 📦 Étape 4 : Déployer

1. Cliquez sur **"Save and Deploy"**
2. Cloudflare va :
   - Cloner votre dépôt
   - Installer les dépendances (`npm install`)
   - Construire l'application (`npm run build`)
   - Déployer les fichiers statiques et les fonctions serverless
3. Attendez quelques minutes (généralement 2-3 minutes)
4. Une fois terminé, vous verrez un lien du type : `https://notaire-as-a-service.pages.dev`

## 🌐 Étape 5 : Configurer un Domaine Personnalisé (Optionnel)

Si vous possédez un nom de domaine chez Cloudflare :

1. Dans votre projet Pages, allez dans l'onglet **"Custom domains"**
2. Cliquez sur **"Set up a custom domain"**
3. Entrez votre domaine (ex: `notaire-ai.com` ou `app.votredomaine.com`)
4. Cloudflare configurera automatiquement :
   - Les enregistrements DNS
   - Le certificat SSL (HTTPS)
   - La redirection HTTP vers HTTPS

Le domaine sera actif en quelques minutes.

## 🧪 Étape 6 : Tester l'Application

1. Ouvrez l'URL de votre application (`.pages.dev` ou votre domaine personnalisé)
2. Testez le formulaire :
   - Remplissez les informations patrimoniales
   - Soumettez le formulaire
   - Vérifiez que l'analyse IA fonctionne

Si vous obtenez une erreur :
- Vérifiez que `GEMINI_API_KEY` est bien configurée dans les variables d'environnement
- Consultez les logs : **Pages** > **Votre Projet** > **View build logs**

## 🔄 Déploiement Continu

**Automatique** : Chaque fois que vous pushez du code sur GitHub, Cloudflare redéploie automatiquement votre application.

Pour désactiver le déploiement automatique :
1. **Pages** > **Votre Projet** > **Settings** > **Builds & deployments**
2. Configurez les branches à déployer

## 📊 Monitoring et Logs

### Voir les Logs de Build
1. **Pages** > **Votre Projet** > **Deployments**
2. Cliquez sur un déploiement
3. Consultez les logs

### Analyser le Trafic
1. **Analytics & Logs** > **Web Analytics**
2. Visualisez les visites, la performance, etc.

### Voir les Erreurs Runtime
Les erreurs des Pages Functions sont visibles dans :
- **Pages** > **Votre Projet** > **Functions** > **Real-time Logs**

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
➡️ **Solution** : Ajoutez la variable d'environnement dans **Settings** > **Environment variables**

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

- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Google AI Studio](https://ai.google.dev/)
- [Support Cloudflare](https://dash.cloudflare.com/support)

## 💰 Limites Gratuites Cloudflare Pages

| Ressource | Limite Gratuite |
|-----------|----------------|
| Builds | 500/mois |
| Requêtes Pages Functions | 100,000/jour |
| Bande passante | Illimitée |
| Projets | Illimité |
| Domaines personnalisés | Illimité |

Pour un projet personnel ou une PME, ces limites sont largement suffisantes.

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation Cloudflare.
