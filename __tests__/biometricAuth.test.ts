jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

import * as LocalAuthentication from 'expo-local-authentication';
import { authenticateForVault, getBiometricAvailability } from '../src/services/biometric/biometricAuth';

const hasHardwareAsync = LocalAuthentication.hasHardwareAsync as jest.MockedFunction<typeof LocalAuthentication.hasHardwareAsync>;
const isEnrolledAsync = LocalAuthentication.isEnrolledAsync as jest.MockedFunction<typeof LocalAuthentication.isEnrolledAsync>;
const authenticateAsync = LocalAuthentication.authenticateAsync as jest.MockedFunction<typeof LocalAuthentication.authenticateAsync>;

describe('biometric vault authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hasHardwareAsync.mockResolvedValue(true);
    isEnrolledAsync.mockResolvedValue(true);
  });

  it('reports hardware and enrollment status', async () => {
    await expect(getBiometricAvailability()).resolves.toEqual({ supported: true, enrolled: true });
  });

  it('does not show a prompt when biometrics are unavailable', async () => {
    hasHardwareAsync.mockResolvedValue(false);
    await expect(authenticateForVault()).resolves.toBe(false);
    expect(authenticateAsync).not.toHaveBeenCalled();
  });

  it('does not show a prompt when no biometric is enrolled', async () => {
    isEnrolledAsync.mockResolvedValue(false);
    await expect(authenticateForVault()).resolves.toBe(false);
    expect(authenticateAsync).not.toHaveBeenCalled();
  });

  it('unlocks only after successful authentication and allows device fallback', async () => {
    authenticateAsync.mockResolvedValue({ success: true });
    await expect(authenticateForVault()).resolves.toBe(true);
    expect(authenticateAsync).toHaveBeenCalledWith(expect.objectContaining({
      disableDeviceFallback: false,
      promptMessage: 'Déverrouiller le coffre médical',
    }));
  });

  it('keeps the vault locked after cancellation or failed authentication', async () => {
    authenticateAsync.mockResolvedValue({ success: false, error: 'user_cancel', warning: undefined });
    await expect(authenticateForVault()).resolves.toBe(false);
  });
});
