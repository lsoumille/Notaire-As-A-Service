# Développement Local avec Pages Functions

Ce guide explique comment tester les Cloudflare Pages Functions localement.

## Option 1 : Développement Frontend Uniquement (Recommandé pour débuter)

Pour le développement rapide sans backend :

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Créez un fichier `.env.local` :
   ```bash
   GEMINI_API_KEY=votre_clé_api_ici
   ```

3. Lancez le serveur de développement Vite :
   ```bash
   npm run dev
   ```

4. L'application sera accessible sur `http://localhost:3000`

⚠️ **Note** : Dans ce mode, l'appel à `/api/chat` échouera car les Pages Functions ne sont pas disponibles localement avec Vite seul.

## Option 2 : Développement avec Pages Functions (Complet)

Pour tester l'application exactement comme en production, utilisez Wrangler (l'outil CLI de Cloudflare).

### Installation

```bash
npm install -g wrangler
# ou
npx wrangler@latest
```

### Configuration

1. Créez un fichier `.dev.vars` à la racine du projet :
   ```
   GEMINI_API_KEY=votre_clé_api_ici
   ```

2. Ce fichier contient les variables d'environnement pour le développement local
   ⚠️ **Ne commitez JAMAIS ce fichier** (il est déjà dans `.gitignore`)

### Lancement

1. **Construisez l'application** :
   ```bash
   npm run build
   ```

2. **Lancez le serveur local avec Pages Functions** :
   ```bash
   npx wrangler pages dev dist
   ```

3. Ouvrez votre navigateur sur `http://localhost:8788`

### Workflow de Développement

1. Modifiez votre code source
2. Reconstruisez : `npm run build`
3. Le serveur Wrangler recharge automatiquement

Pour un rechargement automatique, utilisez deux terminaux :

**Terminal 1** - Watch mode pour le build :
```bash
npm run dev
```

**Terminal 2** - Serveur Wrangler :
```bash
npx wrangler pages dev dist --live-reload
```

## Structure des Fichiers

```
.
├── functions/           # Cloudflare Pages Functions (serverless)
│   └── api/
│       └── chat.ts      # API endpoint pour Gemini
├── src/                 # Code source React
├── dist/                # Build de production
├── .env.local.example   # Template pour les variables locales
├── .dev.vars            # Variables pour Wrangler (git-ignoré)
└── wrangler.toml        # Configuration Cloudflare
```

## Debugging

### Voir les Logs des Functions

Les logs s'affichent directement dans le terminal où vous avez lancé `wrangler pages dev`.

### Tester l'API Directement

```bash
curl -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test",
    "modelName": "gemini-1.5-flash",
    "responseSchema": {}
  }'
```

## Résolution de Problèmes

### "Cannot find module 'wrangler'"
➡️ Installez globalement : `npm install -g wrangler`

### "GEMINI_API_KEY is not defined"
➡️ Créez le fichier `.dev.vars` avec votre clé API

### Port 8788 déjà utilisé
➡️ Spécifiez un autre port : `npx wrangler pages dev dist --port 3001`

## Ressources

- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Functions Local Development](https://developers.cloudflare.com/pages/functions/local-development/)
