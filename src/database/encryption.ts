import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const DATABASE_KEY_NAME = 'MEDHISTORY_DATABASE_KEY_V1';
export const ONBOARDING_COMPLETE_KEY = 'MEDHISTORY_ONBOARDING_COMPLETE_V1';
export const LOCK_MODE_KEY = 'MEDHISTORY_LOCK_MODE_V1';
const KEY_BYTES = 32;

export class DatabaseKeyError extends Error {
  public constructor(message: string) { super(message); this.name = 'DatabaseKeyError'; }
}

/** Returns a 256-bit key encoded as hex for SQLCipher's x'...' pragma syntax. */
export async function getOrCreateDatabaseKeyHex(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DATABASE_KEY_NAME);
  if (existing !== null) {
    if (!/^[0-9a-f]{64}$/i.test(existing)) throw new DatabaseKeyError('La clé de chiffrement enregistrée est invalide.');
    return existing;
  }
  const bytes = await Crypto.getRandomBytesAsync(KEY_BYTES);
  const keyHex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(DATABASE_KEY_NAME, keyHex, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  return keyHex;
}

export function sqlCipherKeyPragma(keyHex: string): string {
  if (!/^[0-9a-f]{64}$/i.test(keyHex)) throw new DatabaseKeyError('Format de clé SQLCipher invalide.');
  return `PRAGMA key = "x'${keyHex}'";`;
}

export async function destroyDatabaseKey(): Promise<void> {
  await SecureStore.deleteItemAsync(DATABASE_KEY_NAME);
  await SecureStore.deleteItemAsync(ONBOARDING_COMPLETE_KEY);
  await SecureStore.deleteItemAsync(LOCK_MODE_KEY);
}
