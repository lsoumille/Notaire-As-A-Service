# Développement Local avec Cloudflare Workers

Ce guide explique comment tester l'application avec Cloudflare Workers et Static Assets localement.

> **Migration** : Cette application utilise maintenant **Cloudflare Workers** au lieu de Cloudflare Pages. Voir [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) pour les détails.

## Démarrage Rapide (Recommandé)

Une seule commande pour lancer le développement complet avec live reload :

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Créez un fichier `.dev.vars` à la racine du projet :
   ```
   GEMINI_API_KEY=votre_clé_api_ici
   ```
   ⚠️ **Ne commitez JAMAIS ce fichier** (il est déjà dans `.gitignore`)

3. Lancez le serveur de développement complet :
   ```bash
   npm run dev
   ```

4. Ouvrez votre navigateur sur `http://localhost:8787`

**Ce qui se passe automatiquement :**
- Vite compile le frontend et surveille les changements (`vite build --watch`)
- Wrangler sert l'application sur le port 8787 avec le Worker
- Les Pages Functions sont compilées automatiquement dans `dist/_worker.js/`
- À chaque sauvegarde de fichier : rebuild automatique + refresh du navigateur

---

## Options de Développement Alternatives

### Option 1 : Frontend Uniquement (Sans API)

Pour développer uniquement l'interface sans accès à l'API Gemini :

```bash
npm run dev:vite
```

L'application sera accessible sur `http://localhost:3000`

⚠️ **Note** : Dans ce mode, l'appel à `/api/chat` échouera car le Worker n'est pas disponible.

### Option 2 : Wrangler Seul (Build Manuel)

Si vous préférez rebuild manuellement :

```bash
# Terminal 1 - Build
npm run build

# Terminal 2 - Serveur
npm run dev:wrangler
```

Ou avec rebuild automatique mais sans le parallel runner :

```bash
# Terminal 1
npm run dev:vite

# Terminal 2 (nouveau terminal)
npm run dev:wrangler
```

---

## Configuration

### Variables d'Environnement

1. **Pour Wrangler** (Workers) : Créez `.dev.vars`
   ```
   GEMINI_API_KEY=votre_clé_api_ici
   ```

2. **Pour Vite seul** : Créez `.env.local`
   ```bash
   GEMINI_API_KEY=votre_clé_api_ici
   ```

### Scripts NPM Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | **Recommandé** - Lance Vite + Wrangler en parallèle avec live reload |
| `npm run dev:vite` | Vite en mode watch (rebuild automatique vers `dist/`) |
| `npm run dev:wrangler` | Wrangler sert `dist/` sur le port 8787 |
| `npm run build` | Build complet : Vite + compilation des Pages Functions |
| `npm run preview` | Preview du build avec Vite |
| `npm run deploy` | Déploiement sur Cloudflare Workers |

---

## Structure des Fichiers

```
.
├── functions/           # Cloudflare Pages Functions (source)
│   └── api/
│       └── chat.ts      # API endpoint pour Gemini
├── components/          # Composants React
├── services/            # Services et logique métier
├── dist/                # Build généré (ne pas modifier)
│   └── _worker.js/      # Worker compilé (généré automatiquement)
├── .env.local.example   # Template pour variables locales Vite
├── .dev.vars            # Variables pour Wrangler (git-ignoré)
├── wrangler.jsonc       # Configuration Cloudflare Workers
└── .assetsignore        # Exclusions pour les assets statiques
```

---

## Debugging

### Voir les Logs

Les logs de Wrangler et Vite s'affichent dans le même terminal grâce à `concurrently`.

### Tester l'API Directement

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test",
    "modelName": "gemini-1.5-flash",
    "responseSchema": {}
  }'
```

---

## Résolution de Problèmes

### "Cannot find module 'wrangler'"
➡️ Installez Wrangler : `npm install -g wrangler` ou utilisez `npx wrangler`

### "GEMINI_API_KEY is not defined"
➡️ Vérifiez que `.dev.vars` existe avec votre clé API

### Port 8787 déjà utilisé
➡️ Modifiez le port dans `package.json` :
```json
"dev:wrangler": "npx wrangler dev --port 3001"
```

### Problèmes de cache
➡️ Videz le dossier `dist/` et redémarrez :
```bash
rm -rf dist && npm run dev
```

### "_worker.js not found"
➡️ Assurez-vous d'avoir exécuté `npm run build` au moins une fois. Le dossier `dist/_worker.js/` doit exister.

---

## Changements depuis Pages

| Avant (Pages) | Après (Workers) |
|---------------|-----------------|
| Port **8788** | Port **8787** |
| `wrangler pages dev` | `wrangler dev` |
| `wrangler.toml` | `wrangler.jsonc` |
| Build automatique des functions | Build explicite avec `wrangler pages functions build` |
| `.pages.dev` | `.workers.dev` |

---

## Ressources

- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Workers with Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Migration Guide : Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Vite Documentation](https://vitejs.dev/guide/)
