import * as SecureStore from 'expo-secure-store';
import { getOrCreateDatabaseKeyHex } from '../../database/encryption';
import { getBiometricAvailability } from '../biometric/biometricAuth';
const COMPLETE_KEY = 'MEDHISTORY_ONBOARDING_COMPLETE_V1';
const LOCK_MODE_KEY = 'MEDHISTORY_LOCK_MODE_V1';
export type LockMode = 'biometric-or-device-pin' | 'device-pin';
export async function isOnboardingComplete(): Promise<boolean> { return (await SecureStore.getItemAsync(COMPLETE_KEY)) === 'true'; }
export async function initializeSecureVault(): Promise<{ lockMode: LockMode }> { await getOrCreateDatabaseKeyHex(); const availability = await getBiometricAvailability(); const lockMode: LockMode = availability.supported && availability.enrolled ? 'biometric-or-device-pin' : 'device-pin'; await SecureStore.setItemAsync(LOCK_MODE_KEY, lockMode); return { lockMode }; }
export async function markOnboardingComplete(): Promise<void> { await SecureStore.setItemAsync(COMPLETE_KEY, 'true'); }
export async function getConfiguredLockMode(): Promise<LockMode | null> { return (await SecureStore.getItemAsync(LOCK_MODE_KEY)) as LockMode | null; }
export async function setConfiguredLockMode(lockMode: LockMode): Promise<void> { await SecureStore.setItemAsync(LOCK_MODE_KEY, lockMode); }
