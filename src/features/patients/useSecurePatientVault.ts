import { useCallback, useEffect, useState } from 'react';
import { getDatabase } from '../../database/connection';
import { authenticateForVault } from '../../services/biometric/biometricAuth';
import { PatientRepository } from './patientRepository';
import { isVaultUnlocked, setVaultUnlocked, subscribeVaultSession } from '../../services/security/vaultSession';

export function useSecurePatientVault() {
  const [unlocked, setUnlocked] = useState(isVaultUnlocked());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeVaultSession(setUnlocked), []);
  const unlock = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      if (!(await authenticateForVault())) {
        setError('Authentification biométrique annulée ou indisponible.');
        return null;
      }
      const repository = new PatientRepository(await getDatabase());
      setVaultUnlocked(true);
      return repository;
    } catch {
      setError('Le coffre médical ne peut pas être déverrouillé.');
      return null;
    } finally { setLoading(false); }
  }, []);

  const lock = useCallback(() => setVaultUnlocked(false), []);
  return { unlocked, loading, error, unlock, lock };
}
