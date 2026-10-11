jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///documents/', deleteAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../src/database/connection', () => ({ closeDatabase: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../src/database/encryption', () => ({ destroyDatabaseKey: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../src/services/security/vaultSession', () => ({ setVaultUnlocked: jest.fn() }));
import * as FileSystem from 'expo-file-system/legacy';
import { closeDatabase } from '../src/database/connection';
import { destroyDatabaseKey } from '../src/database/encryption';
import { setVaultUnlocked } from '../src/services/security/vaultSession';
import { wipeAllMedicalData } from '../src/services/security/dataWipeService';
describe('dataWipeService', () => {
  it('closes the database, purges attachments and destroys the key', async () => { await wipeAllMedicalData(); expect(closeDatabase).toHaveBeenCalled(); expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///documents/medical-attachments/', { idempotent: true }); expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///documents/medhistory.db', { idempotent: true }); expect(destroyDatabaseKey).toHaveBeenCalled(); expect(setVaultUnlocked).toHaveBeenCalledWith(false); });
  it('fails safely when private storage is unavailable', async () => { (FileSystem as { documentDirectory: string | null }).documentDirectory = null; await expect(wipeAllMedicalData()).rejects.toThrow('stockage privé'); (FileSystem as { documentDirectory: string | null }).documentDirectory = 'file:///documents/'; });
});
