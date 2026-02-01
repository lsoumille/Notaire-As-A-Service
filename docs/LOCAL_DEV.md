# Développement Local avec Pages Functions

Ce guide explique comment tester l'application avec Cloudflare Pages Functions localement.

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

4. Ouvrez votre navigateur sur `http://localhost:8788`

**Ce qui se passe automatiquement :**
- Vite compile le frontend et surveille les changements (`vite build --watch`)
- Wrangler sert l'application sur le port 8788 avec les Pages Functions
- À chaque sauvegarde de fichier : rebuild automatique + refresh du navigateur

---

## Options de Développement Alternatives

### Option 1 : Frontend Uniquement (Sans API)

Pour développer uniquement l'interface sans accès à l'API Gemini :

```bash
npm run dev:vite
```

L'application sera accessible sur `http://localhost:3000`

⚠️ **Note** : Dans ce mode, l'appel à `/api/chat` échouera car les Pages Functions ne sont pas disponibles.

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

1. **Pour Wrangler** (Pages Functions) : Créez `.dev.vars`
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
| `npm run dev:wrangler` | Wrangler sert `dist/` sur le port 8788 |
| `npm run build` | Build de production une fois |
| `npm run preview` | Preview du build avec Vite |

---

## Structure des Fichiers

```
.
├── functions/           # Cloudflare Pages Functions (serverless)
│   └── api/
│       └── chat.ts      # API endpoint pour Gemini
├── components/          # Composants React
├── services/            # Services et logique métier
├── dist/                # Build généré (ne pas modifier)
├── .env.local.example   # Template pour variables locales Vite
├── .dev.vars            # Variables pour Wrangler (git-ignoré)
└── wrangler.toml        # Configuration Cloudflare
```

---

## Debugging

### Voir les Logs

Les logs de Wrangler et Vite s'affichent dans le même terminal grâce à `concurrently`.

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

---

## Résolution de Problèmes

### "Cannot find module 'wrangler'"
➡️ Installez Wrangler : `npm install -g wrangler` ou utilisez `npx wrangler`

### "GEMINI_API_KEY is not defined"
➡️ Vérifiez que `.dev.vars` existe avec votre clé API

### Port 8788 déjà utilisé
➡️ Modifiez le port dans `package.json` :
```json
"dev:wrangler": "npx wrangler pages dev dist --port 3001"
```

### Problèmes de cache
➡️ Videz le dossier `dist/` et redémarrez :
```bash
rm -rf dist && npm run dev
```

---

## Ressources

- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Functions Local Development](https://developers.cloudflare.com/pages/functions/local-development/)
- [Vite Documentation](https://vitejs.dev/guide/)
