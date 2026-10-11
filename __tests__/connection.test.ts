jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' }));
jest.mock('expo-crypto', () => ({ getRandomBytesAsync: jest.fn() }));
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import { closeDatabase, getDatabase } from '../src/database/connection';
const openDatabaseAsync = SQLite.openDatabaseAsync as jest.MockedFunction<typeof SQLite.openDatabaseAsync>;
const getItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const database = { execAsync: jest.fn().mockResolvedValue(undefined), closeAsync: jest.fn().mockResolvedValue(undefined) };
describe('encrypted database connection', () => {
  beforeEach(async () => { await closeDatabase(); jest.clearAllMocks(); getItemAsync.mockResolvedValue('ef'.repeat(32)); openDatabaseAsync.mockResolvedValue(database as never); });
  it('applies the SQLCipher key before integrity and schema pragmas', async () => { await getDatabase(); const calls = database.execAsync.mock.calls.map(([sql]) => sql); expect(calls[0]).toBe(`PRAGMA key = "x'${'ef'.repeat(32)}'";`); expect(calls[1]).toBe('PRAGMA foreign_keys = ON;'); expect(calls[2]).toBe('PRAGMA cipher_integrity_check;'); expect(calls[3]).toContain('CREATE TABLE IF NOT EXISTS patient_profiles'); });
  it('caches one open connection and closes it explicitly', async () => { const first = await getDatabase(); expect(await getDatabase()).toBe(first); expect(openDatabaseAsync).toHaveBeenCalledTimes(1); await closeDatabase(); expect(database.closeAsync).toHaveBeenCalledTimes(1); });
  it('runs the legacy column and trigger migration when table introspection is available', async () => { const legacyDb = { ...database, getAllAsync: jest.fn().mockResolvedValue([{ name: 'id' }, { name: 'given_name' }]) }; openDatabaseAsync.mockResolvedValue(legacyDb as never); await getDatabase(); expect(legacyDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('ALTER TABLE patient_profiles ADD COLUMN blood_group')); expect(legacyDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('DROP TRIGGER IF EXISTS patient_profiles_ai')); });
  it('resets the cached promise and exposes a safe error when opening fails', async () => { openDatabaseAsync.mockRejectedValueOnce(new Error('native failure')); await expect(getDatabase()).rejects.toThrow('Impossible d’ouvrir le coffre médical sécurisé'); openDatabaseAsync.mockResolvedValueOnce(database as never); await expect(getDatabase()).resolves.toBe(database); });
});
