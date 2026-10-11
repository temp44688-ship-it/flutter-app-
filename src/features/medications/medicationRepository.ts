import { randomUUID } from 'expo-crypto';
import type * as SQLite from 'expo-sqlite';
import type { Medication, MedicationChange, MedicationStatus, NewMedication } from '../../types/medication';

type MedicationRow = { id: string; patient_id: string; name: string; dosage: string; frequency: string; route: string | null; status: MedicationStatus; start_date_ms: number; end_date_ms: number | null; notes: string | null; supersedes_id: string | null; created_at_ms: number; updated_at_ms: number; stopped_at_ms: number | null };

function toMedication(row: MedicationRow): Medication {
  return { id: row.id, patientId: row.patient_id, name: row.name, dosage: row.dosage, frequency: row.frequency, route: row.route, status: row.status, startDateMs: row.start_date_ms, endDateMs: row.end_date_ms, notes: row.notes, supersedesId: row.supersedes_id, createdAtMs: row.created_at_ms, updatedAtMs: row.updated_at_ms, stoppedAtMs: row.stopped_at_ms };
}

export class MedicationRepository {
  public constructor(private readonly db: SQLite.SQLiteDatabase) {}

  public async create(input: NewMedication): Promise<Medication> {
    const id = randomUUID(); const now = Date.now();
    await this.db.runAsync(`INSERT INTO medications (id, patient_id, name, dosage, frequency, route, status, start_date_ms, notes, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)`, id, input.patientId, input.name.trim(), input.dosage.trim(), input.frequency.trim(), input.route, now, input.notes, now, now);
    return (await this.getById(id))!;
  }

  public async getById(id: string): Promise<Medication | null> {
    const row = await this.db.getFirstAsync<MedicationRow>('SELECT * FROM medications WHERE id = ?', id);
    return row ? toMedication(row) : null;
  }

  public async listByPatient(patientId: string): Promise<Medication[]> {
    const rows = await this.db.getAllAsync<MedicationRow>('SELECT * FROM medications WHERE patient_id = ? ORDER BY start_date_ms DESC, created_at_ms DESC', patientId);
    return rows.map(toMedication);
  }

  /** Replaces, never mutates, the treatment record. Both statements are atomic. */
  public async change(id: string, patch: MedicationChange): Promise<Medication> {
    let created: Medication | null = null;
    await this.db.withTransactionAsync(async () => {
      const previous = await this.getById(id);
      if (!previous) throw new Error('Traitement introuvable.');
      if (previous.status !== 'ACTIVE') throw new Error('Seul un traitement actif peut être modifié.');
      const now = Date.now(); const nextId = randomUUID(); const next = { ...previous, ...patch };
      await this.db.runAsync('UPDATE medications SET status = ?, end_date_ms = ?, stopped_at_ms = ?, updated_at_ms = ? WHERE id = ?', 'STOPPED', now, now, now, previous.id);
      await this.db.runAsync(`INSERT INTO medications (id, patient_id, name, dosage, frequency, route, status, start_date_ms, notes, supersedes_id, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)`, nextId, previous.patientId, next.name.trim(), next.dosage.trim(), next.frequency.trim(), next.route, now, next.notes, previous.id, now, now);
      created = (await this.getById(nextId))!;
    });
    if (!created) throw new Error('Le nouveau traitement n’a pas pu être créé.');
    return created;
  }

  public async stop(id: string, status: Extract<MedicationStatus, 'STOPPED' | 'COMPLETED'>): Promise<void> {
    const now = Date.now();
    await this.db.runAsync('UPDATE medications SET status = ?, end_date_ms = ?, stopped_at_ms = ?, updated_at_ms = ? WHERE id = ? AND status = ?', status, now, now, now, id, 'ACTIVE');
  }

  public async search(patientId: string, query: string): Promise<Medication[]> {
    const term = query.trim();
    if (!term) return this.listByPatient(patientId);
    const rows = await this.db.getAllAsync<MedicationRow>(`SELECT m.* FROM medications m JOIN medical_fts f ON f.entity_id = m.id AND f.entity_type = 'medication' WHERE m.patient_id = ? AND medical_fts MATCH ? ORDER BY m.start_date_ms DESC`, patientId, `${term.replace(/["']/g, ' ')}*`);
    return rows.map(toMedication);
  }
}
