import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricAvailability = { supported: boolean; enrolled: boolean };

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  const [supported, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return { supported, enrolled };
}

export async function authenticateForVault(): Promise<boolean> {
  const availability = await getBiometricAvailability();
  if (!availability.supported || !availability.enrolled) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Déverrouiller le coffre médical',
    cancelLabel: 'Annuler',
    disableDeviceFallback: false,
    fallbackLabel: 'Utiliser le code de l’appareil',
  });
  return result.success;
}
