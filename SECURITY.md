# Module profils patients sécurisé

- La base `medhistory.db` est ouverte avec SQLCipher, puis `PRAGMA key`, `PRAGMA foreign_keys = ON` et `PRAGMA cipher_integrity_check`.
- La clé de 256 bits est générée par `expo-crypto` et conservée uniquement dans `expo-secure-store` avec `WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- L’authentification biométrique (Face ID, Touch ID, empreinte ou code de l’appareil) est exigée avant l’accès au dépôt.
- Les profils sont des UUID v4, les dates persistées sont des timestamps Unix en millisecondes et les suppressions sont logiques pour préserver la synchronisation future.
- Les triggers maintiennent l’index FTS5 hors ligne.
- Aucun log ne contient de clé ou de donnée patient.

## Validation

La configuration `useSQLCipher` nécessite un development build ou un build natif Android/iOS. Expo Go ne valide pas SQLCipher. Exécuter `npm run typecheck` et `npm test`, puis tester sur un appareil réel ou un simulateur configuré avec biométrie.

## Récupération

La perte de la clé SecureStore rend le coffre irrécupérable par conception. Une future fonctionnalité de récupération doit introduire un mécanisme explicite (par exemple export chiffré protégé par une phrase de récupération), sans stocker la clé dans AsyncStorage ou dans le code.

Les pièces jointes sont copiées dans `FileSystem.documentDirectory/medical-attachments/`, un répertoire privé à l’application et non un emplacement média public. Le code contient un point d’extension pour remplacer la copie par un chiffrement AES-GCM natif avant écriture ; tant que ce chiffrement physique n’est pas implémenté, la protection repose sur le sandbox privé du système et le chiffrement du coffre de métadonnées.
