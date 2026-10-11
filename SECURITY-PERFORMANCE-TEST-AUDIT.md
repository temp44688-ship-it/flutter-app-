# Audit de couverture de test et de performances SQLCipher

**Projet :** MedHistory  
**Date :** 2026-10-09  
**Périmètre :** tests Jest/React Native, repositories, connexion chiffrée, schéma SQLite/FTS5, onboarding et export PDF.

## 1. Résumé exécutif

La suite fonctionnelle actuelle est stable dans l’environnement d’audit : **11 suites et 32 tests passent**, et le contrôle TypeScript passe également.

La couverture mesurée est toutefois insuffisante pour qualifier le projet de complètement couvert :

| Indicateur | Résultat |
|---|---:|
| Statements | **64,60 %** |
| Branches | **45,63 %** |
| Functions | **72,60 %** |
| Lines | **75,60 %** |
| Suites | **11/11 réussies** |
| Tests | **32/32 réussis** |

Les performances SQL mesurées sur SQLite + FTS5 sont bonnes sur un jeu synthétique de 5 000 médicaments et 5 000 consultations. **Ces résultats ne sont pas une mesure SQLCipher réelle** : aucun binaire SQLCipher n’est disponible dans le sandbox et aucun build natif iOS/Android n’a été exécuté.

Deux risques prioritaires ont été détectés :

1. **Reproductibilité CI/install :** plusieurs dépendances utilisées par les scripts ou le code ne sont pas déclarées dans le `package.json` actif ; un environnement propre ne peut donc pas exécuter l’audit sans installation manuelle.
2. **Dérive de schéma :** `PatientRepository` utilise `blood_group` et `major_allergies`, mais ces colonnes ne figurent pas dans les deux schémas sources inspectés (`schema_ddl.sql` et `schema.ts`). La migration runtime compense partiellement ce problème, mais le schéma standalone et les triggers ne sont pas autonomes ni cohérents.

## 2. Méthodologie

Commandes exécutées :

```bash
npm run typecheck
npm test
npx jest --runInBand --coverage \
  --coverageReporters=text \
  --coverageReporters=json-summary
npm run router:check
```

Contrôles SQL :

- `PRAGMA integrity_check` ;
- `PRAGMA foreign_keys` ;
- `PRAGMA foreign_key_check` ;
- inspection des index ;
- `EXPLAIN QUERY PLAN` sur les requêtes principales ;
- benchmark SQLite en mémoire avec 5 000 médicaments et 5 000 consultations ;
- benchmark SQLite sur disque avec WAL et 5 000 médicaments.

Limitation importante : `sqlcipher` n’est pas installé dans l’environnement. Le plugin Expo déclare bien `useSQLCipher: true` dans [app.json](./app.json), mais l’activation effective et le coût du chiffrement doivent être validés dans un build natif de développement ou de release.

## 3. Résultats de couverture

### 3.1 Couverture globale

| Couche | Statements | Branches | Functions | Lines | Évaluation |
|---|---:|---:|---:|---:|---|
| Application/dashboard | 91,66 % | 58,82 % | 80 % | 100 % | Bonne sur le rendu testé |
| Base de données | 79,06 % | 64,28 % | 77,77 % | 84,61 % | Correcte, erreurs/migrations incomplètes |
| Repositories | 50–100 % | 16,66–50 % | 57,14–100 % | 40–100 % | Hétérogène |
| Hooks | 27,77 % | 0 % | 50 % | 100 % | Insuffisante |
| Export PDF | 61,53 % | 50 % | 83,33 % | 66,66 % | Partielle |
| Onboarding service | 40 % | 0 % | 50 % | 66,66 % | Insuffisante |

### 3.2 Zones insuffisamment couvertes

- `useMedicalReport` : branche d’erreur, succès de partage et état de chargement non testés.
- `onboardingService` : configuration biométrique disponible/non disponible et lecture du mode de verrouillage non testées.
- `PatientRepository` : lecture, liste, mise à jour et suppression logique non couvertes.
- `AttachmentRepository` et `PrescriptionRepository` : rollback, erreurs SQL et mapping de lignes non couverts.
- `connection.ts` : migration `blood_group`/`major_allergies` et chemin d’échec d’ouverture non couverts.
- UI onboarding : aucun test de rendu multi-étapes, validation des champs ou interaction avec le date picker.
- Partage PDF natif : `Print.printToFileAsync`, indisponibilité de `expo-sharing` et erreur de partage non testés.

### 3.3 Tests actuellement présents

Les tests couvrent correctement :

- génération et formatage de clé SQLCipher ;
- ordre d’ouverture de la connexion et activation des pragmas ;
- authentification biométrique nominale et refus ;
- historisation stricte des médicaments ;
- relations consultations/maladies ;
- prescriptions et pièces jointes ;
- triggers et recherche FTS5 au niveau des chaînes SQL ;
- rendu de base du dashboard ;
- sélection des traitements actifs et des cinq consultations du rapport HTML.

À noter : une partie de la couverture FTS5 vérifie le contenu de `SCHEMA` par assertions textuelles. Cela ne remplace pas une exécution systématique sur SQLite réel pour chaque trigger et chaque opération `INSERT/UPDATE/DELETE`.

## 4. Résultats d’intégrité et de schéma

Sur le schéma chargé dans SQLite 3.45.1 :

```text
PRAGMA integrity_check : ok
PRAGMA foreign_keys     : 1
PRAGMA foreign_key_check: aucune violation
FTS5                   : disponible
```

Les index attendus sont utilisés pour les parcours principaux :

- `idx_medications_patient_status` pour les traitements actifs ;
- `idx_consultations_patient_date` pour les cinq consultations récentes ;
- `idx_prescriptions_patient_date` ;
- `idx_attachments_patient_created` ;
- index de nom patient et de date de mise à jour.

### Dérive de schéma à corriger

Le repository patient insère et met à jour :

```text
blood_group
major_allergies
```

Cependant, l’audit du schéma source actif a trouvé :

```text
schema_ddl.sql : colonnes absentes
schema.ts     : colonnes absentes
```

La connexion tente d’ajouter ces colonnes à chaud avec `ALTER TABLE`, mais :

- le DDL autonome n’est pas suffisant pour créer une base complète ;
- les triggers patients du schéma source n’indexent pas ces champs ;
- les installations ou scripts qui utilisent directement `schema_ddl.sql` peuvent diverger du runtime Expo.

**Priorité : élevée.** Ajouter les colonnes aux deux schémas sources, mettre à jour les triggers FTS patients et conserver une migration versionnée pour les bases déjà installées.

## 5. Mesures de performance SQLite/FTS5

Jeu synthétique : 1 patient, 5 000 médicaments, 5 000 consultations, 10 000 entrées FTS5. Les insertions étaient regroupées dans des transactions.

### 5.1 SQLite en mémoire

| Opération | Moyenne | P95 | Plan observé |
|---|---:|---:|---|
| Insertion de 5 000 médicaments avec triggers | **139,25 ms** | — | Transaction |
| Insertion de 5 000 consultations avec triggers | **113,49 ms** | — | Transaction |
| Liste des médicaments actifs | **0,866 ms** | **1,155 ms** | `idx_medications_patient_status` |
| Cinq consultations récentes | **0,0056 ms** | **0,0229 ms** | `idx_consultations_patient_date` |
| Recherche FTS5 sur médicament | **0,065 ms** | **0,159 ms** | FTS5 virtual table |
| Recherche FTS5 dans notes de consultation | **0,052 ms** | **0,070 ms** | FTS5 virtual table |

Configuration mémoire observée :

```text
SQLite : 3.45.1
foreign_keys : ON
journal_mode : memory
synchronous : FULL
page_size : 4096
```

### 5.2 SQLite sur disque avec WAL

| Opération | Résultat |
|---|---:|
| Insertion de 5 000 médicaments avec triggers | **125,02 ms** |
| Journalisation | `wal` |
| Synchronisation | `NORMAL` |
| Taille de la base après checkpoint | environ **1,25 MiB** |

Ces chiffres sont des ordres de grandeur sur une machine de sandbox, pas des objectifs contractuels pour les appareils mobiles.

### 5.3 Interprétation SQLCipher

L’architecture prépare correctement SQLCipher :

- clé de 256 bits dans `expo-secure-store` ;
- clé appliquée avant l’intégrité et le schéma ;
- plugin Expo configuré avec `useSQLCipher: true` ;
- `PRAGMA foreign_keys = ON`.

Mais l’audit ne peut pas conclure sur :

- le temps d’ouverture avec déchiffrement réel ;
- le coût du `cipher_integrity_check` ;
- le coût de lecture/écriture sur iOS et Android ;
- la compatibilité effective des migrations avec le moteur SQLCipher embarqué.

Un benchmark natif doit être réalisé sur au moins un appareil Android et un appareil iOS, avec une base de test non sensible et les mêmes volumes.

## 6. Problèmes de packaging détectés

Le `package.json` actif ne déclare pas toutes les dépendances utilisées par le code ou les scripts :

- `jest` ;
- `jest-expo` ;
- `ts-jest` ;
- `expo-print` ;
- `expo-sharing` ;
- `expo-asset`.

L’environnement d’audit a dû les installer avec `npm install --no-save` pour exécuter la suite. Sur une machine propre, `npm test` ou les tests d’onboarding/export peuvent échouer avant exécution.

De plus, aucun `package-lock.json` n’était présent dans la copie auditée. Cela empêche une installation reproductible et rend les versions réellement testées moins déterministes.

**Priorité : élevée.** Déclarer toutes les dépendances utilisées, générer et versionner le lockfile, puis valider depuis un environnement propre.

## 7. Plan de correction priorisé

1. **P0 — Packaging reproductible**
   - Ajouter les dépendances manquantes à `package.json`.
   - Générer `package-lock.json`.
   - Tester `npm ci && npm run typecheck && npm test` dans un dossier propre.

2. **P0 — Schéma patient cohérent**
   - Ajouter `blood_group` et `major_allergies` à `schema_ddl.sql` et `schema.ts`.
   - Mettre à jour les triggers `patient_profiles_*`.
   - Ajouter un test SQLite réel de création d’un profil onboarding sur une base vierge et une base legacy.

3. **P1 — Couverture métier**
   - Ajouter un seuil de couverture CI : au minimum 80 % statements/lines et 70 % branches au départ.
   - Tester les branches d’erreur des hooks, repositories, onboarding et export.
   - Remplacer les assertions purement textuelles de schéma par des scénarios SQLite exécutables.

4. **P1 — Validation SQLCipher native**
   - Construire un dev client Android/iOS avec `useSQLCipher: true`.
   - Mesurer ouverture, insertion transactionnelle, recherche FTS5 et fermeture.
   - Vérifier la migration et `cipher_integrity_check` sur une base persistante.

5. **P2 — Performance à grande échelle**
   - Refaire les mesures à 10 000, 50 000 et 100 000 lignes.
   - Mesurer la mémoire, la taille du fichier chiffré et le temps de cold start.
   - Vérifier la taille et le coût des index FTS5 après mises à jour/historisation.

## 8. Verdict

**Fonctionnel : vert** — 32/32 tests et TypeScript passent après installation des outils requis.  
**Performance SQLite/FTS5 : vert provisoire** — index et FTS5 efficaces sur 5 000 + 5 000 lignes.  
**Couverture : orange** — 64,60 % statements et 45,63 % branches, avec plusieurs couches critiques non testées.  
**SQLCipher réel : non conclu** — nécessite un build natif.  
**Packaging et schéma : rouge à corriger** — dépendances non déclarées et dérive des colonnes patient détectées.
