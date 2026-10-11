jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
import * as Crypto from 'expo-crypto';
import { MedicationRepository } from '../src/features/medications/medicationRepository';
import { SCHEMA } from '../src/database/schema';

const randomUUID = Crypto.randomUUID as jest.MockedFunction<typeof Crypto.randomUUID>;
const previous = { id: 'med-old', patient_id: 'patient-1', name: 'Amlodipine', dosage: '5 mg', frequency: 'Une fois par jour', route: 'orale', status: 'ACTIVE' as const, start_date_ms: 100, end_date_ms: null, notes: null, supersedes_id: null, created_at_ms: 100, updated_at_ms: 100, stopped_at_ms: null };
const next = { ...previous, id: 'med-new', dosage: '10 mg', supersedes_id: 'med-old', created_at_ms: 200, updated_at_ms: 200 };
const db = { runAsync: jest.fn().mockResolvedValue({}), getFirstAsync: jest.fn(), getAllAsync: jest.fn(), withTransactionAsync: jest.fn(async (callback: () => Promise<unknown>) => callback()) };

describe('MedicationRepository', () => {
  beforeEach(() => { jest.clearAllMocks(); randomUUID.mockReturnValue('med-new'); });

  it('closes the previous row and creates a new UUID row on dosage change', async () => {
    db.getFirstAsync.mockResolvedValueOnce(previous).mockResolvedValueOnce(next);
    const result = await new MedicationRepository(db as never).change('med-old', { dosage: '10 mg' });
    expect(result.id).toBe('med-new');
    expect(db.withTransactionAsync).toHaveBeenCalled();
    expect(db.runAsync).toHaveBeenNthCalledWith(1, expect.stringContaining('UPDATE medications SET status'), 'STOPPED', expect.any(Number), expect.any(Number), expect.any(Number), 'med-old');
    expect(db.runAsync).toHaveBeenNthCalledWith(2, expect.stringContaining("VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE'"), 'med-new', 'patient-1', 'Amlodipine', '10 mg', 'Une fois par jour', 'orale', expect.any(Number), null, 'med-old', expect.any(Number), expect.any(Number));
  });

  it('stops an active medication without destroying its historical row', async () => {
    await new MedicationRepository(db as never).stop('med-old', 'STOPPED');
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE medications SET status'), 'STOPPED', expect.any(Number), expect.any(Number), expect.any(Number), 'med-old', 'ACTIVE');
  });

  it('uses medical_fts for offline medication search', async () => {
    db.getAllAsync.mockResolvedValue([]);
    await new MedicationRepository(db as never).search('patient-1', 'Amlodipine');
    expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('medical_fts MATCH'), 'patient-1', 'Amlodipine*');
  });

  it('defines FTS5 triggers for create, update and stop operations', () => {
    expect(SCHEMA).toContain('CREATE VIRTUAL TABLE IF NOT EXISTS medical_fts USING fts5');
    expect(SCHEMA).toContain('CREATE TRIGGER IF NOT EXISTS medications_ai');
    expect(SCHEMA).toContain('CREATE TRIGGER IF NOT EXISTS medications_au');
    expect(SCHEMA).toContain("new.status");
  });
});
