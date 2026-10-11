import { useCallback, useState } from 'react';
import { getDatabase } from '../database/connection';
import { PatientRepository } from '../features/patients/patientRepository';
import { MedicationRepository } from '../features/medications/medicationRepository';
import { ConsultationRepository } from '../features/consultations/consultationRepository';
import { shareMedicalReport } from '../services/export/exportService';
export function useMedicalReport() { const [isLoading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState(false); const share = useCallback(async (patientId?: string) => { setLoading(true); setError(null); setSuccess(false); try { const db = await getDatabase(); const patient = patientId ? await new PatientRepository(db).getById(patientId) : (await new PatientRepository(db).list())[0]; if (!patient) throw new Error('Profil patient introuvable.'); const [medications, consultations] = await Promise.all([new MedicationRepository(db).listByPatient(patient.id), new ConsultationRepository(db).listByPatient(patient.id)]); await shareMedicalReport({ patient, medications, consultations }); setSuccess(true); } catch { setError('Le rapport médical n’a pas pu être partagé.'); } finally { setLoading(false); } }, []); return { share, isLoading, error, success }; }
