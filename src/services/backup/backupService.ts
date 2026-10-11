import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { closeDatabase, getDatabase } from '../../database/connection';
import { getOrCreateDatabaseKeyHex, sqlCipherKeyPragma } from '../../database/encryption';

const DATABASE_NAME = 'medhistory.db';
const TEMP_PREFIX = 'medhistory-restore-';

function requirePrivateRoot(): string {
  if (!FileSystem.documentDirectory) throw new Error('Le stockage privé de l’application est indisponible.');
  return FileSystem.documentDirectory;
}

function databasePath(database: SQLite.SQLiteDatabase): string {
  if (!database.databasePath) throw new Error('Le chemin de la base sécurisée est indisponible.');
  return database.databasePath;
}

/** Exports the physical SQLCipher file only after closing it for a consistent snapshot. */
export async function exportEncryptedDatabase(): Promise<void> {
  const database = await getDatabase();
  const source = databasePath(database);
  await closeDatabase();
  const destination = `${requirePrivateRoot()}MedHistory-backup-${Date.now()}.db`;
  try {
    await FileSystem.copyAsync({ from: source, to: destination });
    if (!(await Sharing.isAvailableAsync())) throw new Error('Le partage n’est pas disponible sur cet appareil.');
    await Sharing.shareAsync(destination, { mimeType: 'application/octet-stream', dialogTitle: 'Exporter ma sauvegarde chiffrée' });
  } finally {
    await getDatabase();
  }
}

/**
 * Validates the imported file with the current SQLCipher key before replacing the live file.
 * A wrong key or corrupt database is rejected while the current database remains untouched.
 */
export async function importEncryptedDatabase(): Promise<void> {
  const selection = await DocumentPicker.getDocumentAsync({ type: 'application/octet-stream', copyToCacheDirectory: true });
  if (selection.canceled || !selection.assets[0]?.uri) return;
  const keyHex = await getOrCreateDatabaseKeyHex();
  const root = requirePrivateRoot();
  const temporaryName = `${TEMP_PREFIX}${Date.now()}.db`;
  const temporaryUri = `${root}${temporaryName}`;
  const selectedUri = selection.assets[0].uri;
  await FileSystem.copyAsync({ from: selectedUri, to: temporaryUri });
  let candidate: SQLite.SQLiteDatabase | null = null;
  try {
    candidate = await SQLite.openDatabaseAsync(temporaryName, {}, root);
    await candidate.execAsync(sqlCipherKeyPragma(keyHex));
    await candidate.execAsync('PRAGMA cipher_integrity_check;');
    await candidate.getFirstAsync<{ ok: number }>('SELECT 1 AS ok');
    await candidate.closeAsync();
    candidate = null;
    const current = await getDatabase();
    const currentPath = databasePath(current);
    await closeDatabase();
    await FileSystem.copyAsync({ from: temporaryUri, to: currentPath });
    await getDatabase();
  } catch (error) {
    if (candidate) await candidate.closeAsync();
    throw new Error('La sauvegarde est invalide ou incompatible avec la clé de ce coffre.', { cause: error });
  } finally {
    await FileSystem.deleteAsync(temporaryUri, { idempotent: true });
  }
}
