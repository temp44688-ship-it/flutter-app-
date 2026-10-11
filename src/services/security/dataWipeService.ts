import * as FileSystem from 'expo-file-system/legacy';
import { closeDatabase } from '../../database/connection';
import { destroyDatabaseKey } from '../../database/encryption';
import { setVaultUnlocked } from './vaultSession';

const DATABASE_NAME = 'medhistory.db';
const ATTACHMENTS_DIRECTORY = 'medical-attachments';

export async function wipeAllMedicalData(): Promise<void> {
  const root = FileSystem.documentDirectory;
  if (!root) throw new Error('Le stockage privé de l’application est indisponible.');
  await closeDatabase();
  await FileSystem.deleteAsync(`${root}${ATTACHMENTS_DIRECTORY}/`, { idempotent: true });
  await FileSystem.deleteAsync(`${root}${DATABASE_NAME}`, { idempotent: true });
  await destroyDatabaseKey();
  setVaultUnlocked(false);
}
