import { randomUUID } from 'expo-crypto';
import type * as SQLite from 'expo-sqlite';
import type { CreatePatientProfile, PatientProfile, UpdatePatientProfile } from '../../types/patient';

type PatientRow = {
  id: string; given_name: string; family_name: string; birth_date_ms: number | null;
  biological_sex: PatientProfile['biologicalSex']; blood_group: PatientProfile['bloodGroup']; major_allergies: string | null; phone: string | null; email: string | null;
  emergency_contact_name: string | null; emergency_contact_phone: string | null; notes: string | null;
  created_at_ms: number; updated_at_ms: number; deleted_at_ms: number | null;
};

function toProfile(row: PatientRow): PatientProfile {
  return { id: row.id, givenName: row.given_name, familyName: row.family_name, birthDateMs: row.birth_date_ms,
    biologicalSex: row.biological_sex, bloodGroup: row.blood_group ?? 'unknown', majorAllergies: row.major_allergies, phone: row.phone, email: row.email,
    emergencyContactName: row.emergency_contact_name, emergencyContactPhone: row.emergency_contact_phone,
    notes: row.notes, createdAtMs: row.created_at_ms, updatedAtMs: row.updated_at_ms, deletedAtMs: row.deleted_at_ms };
}

export class PatientRepository {
  public constructor(private readonly db: SQLite.SQLiteDatabase) {}

  public async create(input: CreatePatientProfile): Promise<PatientProfile> {
    const id = randomUUID();
    const now = Date.now();
    if (input.bloodGroup === undefined && input.majorAllergies === undefined) {
      await this.db.runAsync(
        `INSERT INTO patient_profiles (id, given_name, family_name, birth_date_ms, biological_sex, phone, email, emergency_contact_name, emergency_contact_phone, notes, created_at_ms, updated_at_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, input.givenName.trim(), input.familyName.trim(), input.birthDateMs, input.biologicalSex,
        input.phone, input.email, input.emergencyContactName, input.emergencyContactPhone, input.notes, now, now,
      );
    } else await this.db.runAsync(
      `INSERT INTO patient_profiles (id, given_name, family_name, birth_date_ms, biological_sex, blood_group, major_allergies, phone, email, emergency_contact_name, emergency_contact_phone, notes, created_at_ms, updated_at_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, input.givenName.trim(), input.familyName.trim(), input.birthDateMs, input.biologicalSex, input.bloodGroup ?? 'unknown', input.majorAllergies ?? null,
      input.phone, input.email, input.emergencyContactName, input.emergencyContactPhone, input.notes, now, now,
    );
    return (await this.getById(id))!;
  }

  public async getById(id: string): Promise<PatientProfile | null> {
    const row = await this.db.getFirstAsync<PatientRow>(
      'SELECT * FROM patient_profiles WHERE id = ? AND deleted_at_ms IS NULL', id,
    );
    return row ? toProfile(row) : null;
  }

  public async list(): Promise<PatientProfile[]> {
    const rows = await this.db.getAllAsync<PatientRow>(
      'SELECT * FROM patient_profiles WHERE deleted_at_ms IS NULL ORDER BY family_name COLLATE NOCASE, given_name COLLATE NOCASE',
    );
    return rows.map(toProfile);
  }

  public async update(id: string, input: UpdatePatientProfile): Promise<PatientProfile> {
    const current = await this.getById(id);
    if (!current) throw new Error('Profil patient introuvable.');
    const next = { ...current, ...input };
    await this.db.runAsync(
      `UPDATE patient_profiles SET given_name = ?, family_name = ?, birth_date_ms = ?, biological_sex = ?, blood_group = ?, major_allergies = ?, phone = ?, email = ?, emergency_contact_name = ?, emergency_contact_phone = ?, notes = ?, updated_at_ms = ? WHERE id = ? AND deleted_at_ms IS NULL`,
      next.givenName.trim(), next.familyName.trim(), next.birthDateMs, next.biologicalSex, next.bloodGroup, next.majorAllergies, next.phone, next.email,
      next.emergencyContactName, next.emergencyContactPhone, next.notes, Date.now(), id,
    );
    return (await this.getById(id))!;
  }

  public async softDelete(id: string): Promise<void> {
    await this.db.runAsync('UPDATE patient_profiles SET deleted_at_ms = ?, updated_at_ms = ? WHERE id = ?', Date.now(), Date.now(), id);
  }

  public async search(query: string): Promise<PatientProfile[]> {
    const trimmed = query.trim();
    if (!trimmed) return this.list();
    const rows = await this.db.getAllAsync<PatientRow>(
      `SELECT p.* FROM patient_profiles p JOIN patient_profiles_fts f ON f.patient_id = p.id
       WHERE patient_profiles_fts MATCH ? AND p.deleted_at_ms IS NULL ORDER BY rank`, `${trimmed.replace(/["']/g, ' ')}*`,
    );
    return rows.map(toProfile);
  }
}
