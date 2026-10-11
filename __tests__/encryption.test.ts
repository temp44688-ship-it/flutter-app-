jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { DatabaseKeyError, destroyDatabaseKey, getOrCreateDatabaseKeyHex, sqlCipherKeyPragma } from '../src/database/encryption';

const getItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const setItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const getRandomBytesAsync = Crypto.getRandomBytesAsync as jest.MockedFunction<typeof Crypto.getRandomBytesAsync>;

describe('SQLCipher key management', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reuses a valid key from SecureStore without generating or rewriting it', async () => {
    const existing = 'ab'.repeat(32);
    getItemAsync.mockResolvedValue(existing);

    await expect(getOrCreateDatabaseKeyHex()).resolves.toBe(existing);
    expect(getRandomBytesAsync).not.toHaveBeenCalled();
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  it('generates exactly 256 bits and stores the hex key only in SecureStore', async () => {
    getItemAsync.mockResolvedValue(null);
    getRandomBytesAsync.mockResolvedValue(new Uint8Array(Array.from({ length: 32 }, (_, i) => i)));

    const key = await getOrCreateDatabaseKeyHex();

    expect(key).toBe('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    expect(setItemAsync).toHaveBeenCalledWith(
      'MEDHISTORY_DATABASE_KEY_V1', key,
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('rejects malformed persisted keys and unsafe pragma input', async () => {
    getItemAsync.mockResolvedValue('not-a-key');
    await expect(getOrCreateDatabaseKeyHex()).rejects.toBeInstanceOf(DatabaseKeyError);
    expect(() => sqlCipherKeyPragma('short')).toThrow(DatabaseKeyError);
  });

  it('formats a valid key as a SQLCipher x-blob pragma', () => {
    const key = 'cd'.repeat(32);
    expect(sqlCipherKeyPragma(key)).toBe(`PRAGMA key = "x'${key}'";`);
  });

  it('destroys the database key and onboarding secrets from SecureStore', async () => {
    await destroyDatabaseKey();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('MEDHISTORY_DATABASE_KEY_V1');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('MEDHISTORY_ONBOARDING_COMPLETE_V1');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('MEDHISTORY_LOCK_MODE_V1');
  });
});
