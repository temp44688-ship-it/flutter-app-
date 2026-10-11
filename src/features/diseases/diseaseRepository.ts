import { randomUUID } from 'expo-crypto';
import type * as SQLite from 'expo-sqlite';
import type { Disease, NewDisease } from '../../types/consultation';
type Row = { id: string; name: string; description: string | null; created_at_ms: number; updated_at_ms: number };
const map = (row: Row): Disease => ({ id: row.id, name: row.name, description: row.description, createdAtMs: row.created_at_ms, updatedAtMs: row.updated_at_ms });
export class DiseaseRepository {
  public constructor(private readonly db: SQLite.SQLiteDatabase) {}
  public async create(input: NewDisease): Promise<Disease> { const id = randomUUID(); const now = Date.now(); await this.db.runAsync('INSERT INTO diseases (id, name, description, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?)', id, input.name.trim(), input.description, now, now); return (await this.getById(id))!; }
  public async getById(id: string): Promise<Disease | null> { const row = await this.db.getFirstAsync<Row>('SELECT * FROM diseases WHERE id = ?', id); return row ? map(row) : null; }
  public async list(): Promise<Disease[]> { const rows = await this.db.getAllAsync<Row>('SELECT * FROM diseases ORDER BY name COLLATE NOCASE'); return rows.map(map); }
}
