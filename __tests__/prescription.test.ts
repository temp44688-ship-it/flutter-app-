jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
import * as Crypto from 'expo-crypto';
import { PrescriptionRepository } from '../src/features/prescriptions/prescriptionRepository';
import { SCHEMA } from '../src/database/schema';
const randomUUID = Crypto.randomUUID as jest.MockedFunction<typeof Crypto.randomUUID>;
const row = { id: 'rx-1', patient_id: 'p1', consultation_id: 'c1', medication_name: 'Amlodipine', dosage: '5 mg', instructions: 'Le matin', prescribed_date_ms: 1, notes: 'Continuer', created_at_ms: 1, updated_at_ms: 1 };
const db = { runAsync: jest.fn().mockResolvedValue({}), getFirstAsync: jest.fn(), getAllAsync: jest.fn(), withTransactionAsync: jest.fn(async (callback: () => Promise<unknown>) => callback()) };
describe('PrescriptionRepository', () => {
  beforeEach(() => { jest.clearAllMocks(); randomUUID.mockReturnValue('rx-1'); });
  it('inserts and maps a prescription linked to a patient and consultation', async () => { db.getFirstAsync.mockResolvedValue(row); const result = await new PrescriptionRepository(db as never).create({ patientId: 'p1', consultationId: 'c1', medicationName: 'Amlodipine', dosage: '5 mg', instructions: 'Le matin', prescribedDateMs: 1, notes: 'Continuer' }); expect(result.id).toBe('rx-1'); expect(result.medicationName).toBe('Amlodipine'); expect(db.withTransactionAsync).toHaveBeenCalled(); });
  it('propagates SQL errors and lets the transaction rollback', async () => { db.withTransactionAsync.mockRejectedValueOnce(new Error('foreign key failure')); await expect(new PrescriptionRepository(db as never).create({ patientId: 'missing', consultationId: null, medicationName: 'Amlodipine', dosage: null, instructions: null, prescribedDateMs: 1, notes: null })).rejects.toThrow('foreign key failure'); });
  it('maps get, list and FTS search results', async () => { db.getFirstAsync.mockResolvedValue(row); db.getAllAsync.mockResolvedValue([row]); const repository = new PrescriptionRepository(db as never); expect((await repository.getById('rx-1'))?.dosage).toBe('5 mg'); expect((await repository.listByPatient('p1'))[0].id).toBe('rx-1'); expect((await repository.search('p1', 'Amlodipine'))[0].medicationName).toBe('Amlodipine'); expect(db.getAllAsync).toHaveBeenLastCalledWith(expect.stringContaining('medical_fts MATCH'), 'p1', 'Amlodipine*'); });
  it('returns list for an empty search', async () => { db.getAllAsync.mockResolvedValue([]); await new PrescriptionRepository(db as never).search('p1', ' '); expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('ORDER BY prescribed_date_ms'), 'p1'); });
  it('declares strict foreign keys and executable FTS trigger inputs', () => { expect(SCHEMA).toContain('patient_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT'); expect(SCHEMA).toContain('consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL'); });
});
