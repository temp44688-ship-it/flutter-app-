import * as SQLite from 'expo-sqlite';
import { getOrCreateDatabaseKeyHex, sqlCipherKeyPragma } from './encryption';
import { SCHEMA } from './schema';

const DATABASE_NAME = 'medhistory.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openEncryptedDatabase(): Promise<SQLite.SQLiteDatabase> {
  const keyHex = await getOrCreateDatabaseKeyHex();
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await database.execAsync(sqlCipherKeyPragma(keyHex));
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync('PRAGMA cipher_integrity_check;');
  await database.execAsync(SCHEMA);
  if (typeof database.getAllAsync === 'function') {
    const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(patient_profiles)');
    const names = new Set(columns.map((column) => column.name));
    if (!names.has('blood_group')) await database.execAsync("ALTER TABLE patient_profiles ADD COLUMN blood_group TEXT NOT NULL DEFAULT 'unknown'");
    if (!names.has('major_allergies')) await database.execAsync('ALTER TABLE patient_profiles ADD COLUMN major_allergies TEXT');
    await database.execAsync(`DROP TRIGGER IF EXISTS patient_profiles_ai; DROP TRIGGER IF EXISTS patient_profiles_au; CREATE TRIGGER patient_profiles_ai AFTER INSERT ON patient_profiles BEGIN INSERT INTO patient_profiles_fts(patient_id, content_text) VALUES (new.id, trim(new.given_name || ' ' || new.family_name || ' ' || coalesce(new.blood_group, '') || ' ' || coalesce(new.major_allergies, '') || ' ' || coalesce(new.phone, '') || ' ' || coalesce(new.email, '') || ' ' || coalesce(new.emergency_contact_name, '') || ' ' || coalesce(new.notes, ''))); END; CREATE TRIGGER patient_profiles_au AFTER UPDATE ON patient_profiles BEGIN DELETE FROM patient_profiles_fts WHERE patient_id = old.id; INSERT INTO patient_profiles_fts(patient_id, content_text) VALUES (new.id, trim(new.given_name || ' ' || new.family_name || ' ' || coalesce(new.blood_group, '') || ' ' || coalesce(new.major_allergies, '') || ' ' || coalesce(new.phone, '') || ' ' || coalesce(new.email, '') || ' ' || coalesce(new.emergency_contact_name, '') || ' ' || coalesce(new.notes, ''))); END;`);
  }
  return database;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= openEncryptedDatabase().catch((error: unknown) => {
    databasePromise = null;
    throw new Error('Impossible d’ouvrir le coffre médical sécurisé.', { cause: error });
  });
  return databasePromise;
}

export async function closeDatabase(): Promise<void> {
  const current = databasePromise;
  databasePromise = null;
  if (current) {
    await (await current).closeAsync();
  }
}
