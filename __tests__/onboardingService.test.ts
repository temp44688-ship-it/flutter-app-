jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));
jest.mock('../src/database/encryption', () => ({ getOrCreateDatabaseKeyHex: jest.fn().mockResolvedValue('ab'.repeat(32)) }));
jest.mock('../src/services/biometric/biometricAuth', () => ({ getBiometricAvailability: jest.fn() }));
import * as SecureStore from 'expo-secure-store';
import { getBiometricAvailability } from '../src/services/biometric/biometricAuth';
import { getConfiguredLockMode, initializeSecureVault, isOnboardingComplete, markOnboardingComplete, setConfiguredLockMode } from '../src/services/onboarding/onboardingService';
const availability = getBiometricAvailability as jest.MockedFunction<typeof getBiometricAvailability>;
const getItem = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
describe('onboardingService', () => {
  beforeEach(() => { jest.clearAllMocks(); availability.mockResolvedValue({ supported: false, enrolled: false }); getItem.mockResolvedValue(null); });
  it('chooses device PIN when biometric hardware or enrollment is unavailable', async () => { await expect(initializeSecureVault()).resolves.toEqual({ lockMode: 'device-pin' }); expect(SecureStore.setItemAsync).toHaveBeenCalledWith('MEDHISTORY_LOCK_MODE_V1', 'device-pin'); });
  it('chooses biometric with device fallback when available', async () => { availability.mockResolvedValue({ supported: true, enrolled: true }); await expect(initializeSecureVault()).resolves.toEqual({ lockMode: 'biometric-or-device-pin' }); });
  it('reads and persists the configured mode and completion flag', async () => { getItem.mockResolvedValueOnce('biometric-or-device-pin').mockResolvedValueOnce('true'); await expect(getConfiguredLockMode()).resolves.toBe('biometric-or-device-pin'); await setConfiguredLockMode('device-pin'); expect(SecureStore.setItemAsync).toHaveBeenCalledWith('MEDHISTORY_LOCK_MODE_V1', 'device-pin'); await expect(isOnboardingComplete()).resolves.toBe(true); });
  it('persists completion after profile creation', async () => { await markOnboardingComplete(); expect(SecureStore.setItemAsync).toHaveBeenCalledWith('MEDHISTORY_ONBOARDING_COMPLETE_V1', 'true'); });
});
