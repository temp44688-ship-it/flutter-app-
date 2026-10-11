import { useCallback, useState } from 'react';
import { exportEncryptedDatabase, importEncryptedDatabase } from '../services/backup/backupService';

export function useBackup() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const run = useCallback(async (action: () => Promise<void>, message: string) => { setLoading(true); setError(null); setSuccess(null); try { await action(); setSuccess(message); } catch { setError('L’opération de sauvegarde a échoué. Vérifiez le fichier et réessayez.'); } finally { setLoading(false); } }, []);
  const exportBackup = useCallback(() => run(exportEncryptedDatabase, 'Sauvegarde chiffrée exportée.'), [run]);
  const importBackup = useCallback(() => run(importEncryptedDatabase, 'Sauvegarde restaurée avec succès.'), [run]);
  return { isLoading, error, success, exportBackup, importBackup };
}
