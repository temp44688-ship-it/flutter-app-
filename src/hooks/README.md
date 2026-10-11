# Couche d’interfaçage

Les composants React Native ne connaissent ni SQLite, ni SQLCipher, ni les repositories. Ils consomment les hooks `useMedications`, `useConsultations`, `usePrescriptions`, `useAttachments` et `useSearch`, qui exposent `data`, `isLoading`, `error` et les actions métier.

Les hooks obtiennent la connexion via `getDatabase()`, convertissent les exceptions techniques en messages compréhensibles et centralisent le rechargement des données.
