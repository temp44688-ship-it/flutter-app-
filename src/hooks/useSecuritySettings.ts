import { useCallback, useEffect, useState } from 'react';
import { getBiometricAvailability } from '../services/biometric/biometricAuth';
import { getConfiguredLockMode, initializeSecureVault, setConfiguredLockMode, type LockMode } from '../services/onboarding/onboardingService';
import { wipeAllMedicalData } from '../services/security/dataWipeService';

export function useSecuritySettings() {
  const [lockMode, setLockMode] = useState<LockMode | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setLoading(true); setError(null); try { const [availability, configured] = await Promise.all([getBiometricAvailability(), getConfiguredLockMode()]); setBiometricAvailable(availability.supported && availability.enrolled); setLockMode(configured); } catch { setError('Impossible de lire les préférences de sécurité.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const configureLock = useCallback(async (preferBiometric: boolean) => { setLoading(true); setError(null); try { const configured = await initializeSecureVault(); const selected: LockMode = preferBiometric && biometricAvailable ? configured.lockMode : 'device-pin'; await setConfiguredLockMode(selected); setLockMode(selected); } catch { setError('Le verrouillage n’a pas pu être modifié.'); throw new Error('Security settings failed'); } finally { setLoading(false); } }, [biometricAvailable]);
  const wipe = useCallback(async () => { setLoading(true); setError(null); try { await wipeAllMedicalData(); } catch { setError('L’effacement sécurisé a échoué.'); throw new Error('Data wipe failed'); } finally { setLoading(false); } }, []);
  return { lockMode, biometricAvailable, isLoading, error, refresh, configureLock, wipe };
}
