# MedHistory — dossier médical offline-first

MedHistory est une application mobile Expo/React Native destinée à conserver un dossier médical local, chiffré et utilisable hors connexion.

## Installation stricte

Pré-requis : Node.js 22+, npm et un environnement de build iOS/Android pour les modules natifs.

```bash
npm ci
npm run typecheck
npm test
```

La commande `npm ci` utilise exclusivement `package-lock.json` afin d’obtenir une installation reproductible. Ne jamais committer `node_modules/`, les builds ou des données patient.

## Architecture

- **Présentation** : routes Expo Router dans `app/` et composants React Native dans `src/components/`.
- **Hooks** : `src/hooks/` expose `data`, `isLoading`, `error` et les actions métier. L’UI ne contient ni SQL, ni accès direct à SecureStore, SQLite ou aux repositories.
- **Domaine** : repositories typés dans `src/features/` pour patients, médicaments, consultations, maladies, prescriptions et pièces jointes.
- **Persistance** : `expo-sqlite` configuré avec SQLCipher AES-256, clé 256 bits conservée exclusivement dans `expo-secure-store`, clés étrangères activées et FTS5 pour la recherche hors ligne.
- **Sécurité** : biométrie avec fallback vers le code de l’appareil, session mémoire du coffre, stockage privé des pièces jointes, sauvegarde validée par la clé avant restauration et effacement complet réversible uniquement par nouvel onboarding.
- **Design** : thème clair/sombre via `useColorScheme`, couleurs à contraste élevé, textes redimensionnables et zones tactiles d’au moins 56 dp.

## Tests et qualité

```bash
npm run typecheck
npm test
npm test -- --coverage --coverageReporters=text --coverageReporters=json-summary
npm run router:check
```

La suite couvre les règles métier, les transactions, les contraintes FK, les triggers FTS5, SQLCipher, onboarding, export PDF, sauvegarde/restauration, data wipe et navigation. Les seuils Jest sont de **80 % statements/lines** et **70 % branches**.

## EAS Build et stores

Le projet est configuré par `app.json` et `eas.json` avec les profils `development`, `preview` et `production`.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
eas build --profile preview --platform all
eas build --profile production --platform all
eas submit --profile production --platform all
```

Avant un build store : vérifier les identifiants natifs, les certificats EAS, les permissions biométriques, le plugin SQLCipher et les assets dans `assets/`. Les données de production ne doivent jamais être incluses dans l’archive ou les logs de build.

## Configuration native

- Bundle iOS : `com.medhistory.app`
- Package Android : `com.medhistory.app`
- Orientation : portrait verrouillé
- Splash : `assets/splash.png`
- Icône : `assets/icon.png`
- Router : `expo-router/entry`
- SQLCipher et FTS5 activés par plugin Expo SQLite

## Livraison et maintenance

1. Installer avec `npm ci`.
2. Exécuter typecheck, tests, couverture et export Router.
3. Contrôler `app.json`, `eas.json`, les certificats et les identifiants avant publication.
4. Tester sur un appareil iOS et Android réel : déverrouillage, backup/restore, import incompatible, data wipe, biométrie et mode sombre.
5. Ne jamais partager une clé SQLCipher, un PIN ou une base médicale non chiffrée.
