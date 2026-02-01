<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Transmission Facile - Notaire As A Service

Application d'analyse patrimoniale utilisant l'IA Gemini pour proposer des stratégies de transmission optimisées.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` environment variable:
   - For local development, create a `.env.local` file at the root of the project
   - Add: `GEMINI_API_KEY=your_api_key_here`

3. Run the app:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:8787`

## Deploy to Cloudflare Workers

Cette application est configurée pour être déployée sur **Cloudflare Workers** avec une architecture sécurisée qui protège votre clé API.

> **Migration Notice** : This app has been migrated from Cloudflare Pages to Cloudflare Workers. See [docs/MIGRATION_SUMMARY.md](./docs/MIGRATION_SUMMARY.md) for details.

### Architecture

- **Frontend**: Application React/Vite statique
- **Backend**: Cloudflare Worker (compilé depuis `/functions/api/chat.ts`)
- **Sécurité**: La clé API Gemini est stockée côté serveur et n'est jamais exposée au client

### Configuration du Déploiement

1. **Connecter le dépôt GitHub à Cloudflare Workers**:
   - Connectez-vous à votre compte Cloudflare
   - Allez dans **Workers & Pages** > **Create** > **Workers**
   - Cliquez sur **"Connect to Git"**
   - Sélectionnez votre dépôt GitHub `Notaire-As-A-Service`

2. **Configuration du Build**:
   - **Build command**: `npm run build` (compiles Vite + Pages Functions)
   - **Build output directory**: `dist`

3. **Variables d'Environnement** (IMPORTANT):
   - Allez dans **Settings** > **Variables and Secrets**
   - Ajoutez une variable:
     - **Variable name**: `GEMINI_API_KEY`
     - **Value**: Votre clé API Google AI Studio
   - ⚠️ **Ne committez JAMAIS votre clé API dans le code source**

4. **Domaine Personnalisé** (Optionnel):
   - Allez dans l'onglet **Settings** > **Triggers** > **Custom Domains**
   - Ajoutez votre domaine (ex: `notaire-ai.com`)
   - Cloudflare configurera automatiquement le DNS

### Fonctionnement

L'application utilise une architecture full-stack:
- Le frontend appelle `/api/chat` (endpoint local)
- Cloudflare Worker intercepte cette requête
- La fonction serveur appelle l'API Gemini avec la clé sécurisée
- La réponse est retournée au frontend

### Sécurité

✅ La clé API reste sur les serveurs Cloudflare  
✅ Aucune exposition de secrets côté client  
✅ Protection CORS configurée  
✅ Possibilité d'ajouter de l'authentification facilement

### Ressources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers with Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Migration Guide : Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Google AI Studio](https://ai.google.dev/)
