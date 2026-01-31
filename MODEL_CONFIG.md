# Configuration du Modèle Gemini

## Modèle Utilisé

**Modèle actuel**: `gemini-3-pro-preview`

Ce modèle était celui configuré dans l'application originale.

## Notes

- **`gemini-3-pro-preview`** : Modèle preview/expérimental de Google, possiblement une version avancée avec plus de capacités
- Si ce modèle n'est plus disponible, vous pouvez le remplacer par :
  - `gemini-1.5-pro` - Version Pro stable (recommandé pour production)
  - `gemini-1.5-flash` - Version rapide et économique
  - `gemini-2.0-flash-exp` - Version expérimentale la plus récente

## Comment Changer le Modèle

1. Modifiez le fichier `services/geminiService.ts`
2. Changez la constante `MODEL_NAME` avec le nom du modèle souhaité
3. Testez l'application pour vérifier la compatibilité

## Vérification des Modèles Disponibles

Consultez la documentation Google AI Studio pour la liste des modèles disponibles :
https://ai.google.dev/gemini-api/docs/models

## Impact sur les Performances

Différents modèles ont des caractéristiques différentes :
- **Pro** : Plus puissant, meilleure qualité de réponse, plus lent
- **Flash** : Plus rapide, moins coûteux, qualité légèrement inférieure
- **Preview/Experimental** : Accès anticipé aux nouvelles fonctionnalités

Pour votre cas d'usage (analyse patrimoniale juridique complexe), un modèle Pro est recommandé.
