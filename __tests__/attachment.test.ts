jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('../src/services/storage/privateAttachmentStorage', () => ({ copyAttachmentToPrivateStorage: jest.fn(), deletePrivateAttachment: jest.fn() }));
import * as Crypto from 'expo-crypto';
import { copyAttachmentToPrivateStorage, deletePrivateAttachment } from '../src/services/storage/privateAttachmentStorage';
import { AttachmentRepository } from '../src/features/attachments/attachmentRepository';
import { SCHEMA } from '../src/database/schema';
const randomUUID = Crypto.randomUUID as jest.MockedFunction<typeof Crypto.randomUUID>;
const copy = copyAttachmentToPrivateStorage as jest.MockedFunction<typeof copyAttachmentToPrivateStorage>;
const remove = deletePrivateAttachment as jest.MockedFunction<typeof deletePrivateAttachment>;
const row = { id: 'att-1', patient_id: 'p1', consultation_id: 'c1', prescription_id: 'rx1', file_name: 'ordonnance.pdf', mime_type: 'application/pdf', file_uri: 'file:///private/att-1-ordonnance.pdf', file_size_bytes: 12, notes: 'Ordonnance', created_at_ms: 1, updated_at_ms: 1 };
const db = { runAsync: jest.fn().mockResolvedValue({}), getFirstAsync: jest.fn(), getAllAsync: jest.fn(), withTransactionAsync: jest.fn(async (callback: () => Promise<unknown>) => callback()) };
describe('AttachmentRepository', () => {
  beforeEach(() => { jest.clearAllMocks(); randomUUID.mockReturnValue('att-1'); copy.mockResolvedValue(row.file_uri); });
  it('copies to private storage before inserting metadata and maps the row', async () => { db.getFirstAsync.mockResolvedValue(row); const result = await new AttachmentRepository(db as never).create({ patientId: 'p1', consultationId: 'c1', prescriptionId: 'rx1', fileName: 'ordonnance.pdf', mimeType: 'application/pdf', fileSizeBytes: 12, notes: 'Ordonnance' }, 'content://source'); expect(result.fileUri).toContain('/private/'); expect(result.notes).toBe('Ordonnance'); expect(copy).toHaveBeenCalledWith('content://source', 'att-1', 'ordonnance.pdf'); });
  it('deletes the private file when SQL insertion or mapping fails', async () => { db.withTransactionAsync.mockRejectedValueOnce(new Error('SQL failure')); await expect(new AttachmentRepository(db as never).create({ patientId: 'p1', consultationId: null, prescriptionId: null, fileName: 'x.pdf', mimeType: 'application/pdf', fileSizeBytes: null, notes: null }, 'content://source')).rejects.toThrow('SQL failure'); expect(remove).toHaveBeenCalledWith(row.file_uri); });
  it('maps get, list and FTS search results', async () => { db.getFirstAsync.mockResolvedValue(row); db.getAllAsync.mockResolvedValue([row]); const repository = new AttachmentRepository(db as never); expect((await repository.getById('att-1'))?.fileName).toBe('ordonnance.pdf'); expect((await repository.listByPatient('p1'))[0].mimeType).toBe('application/pdf'); expect((await repository.search('p1', 'ordonnance'))[0].id).toBe('att-1'); expect(db.getAllAsync).toHaveBeenLastCalledWith(expect.stringContaining('medical_fts MATCH'), 'p1', 'ordonnance*'); });
  it('uses the patient, consultation and prescription foreign keys', () => { expect(SCHEMA).toContain('patient_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT'); expect(SCHEMA).toContain('consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL'); expect(SCHEMA).toContain('prescription_id TEXT REFERENCES prescriptions(id) ON DELETE SET NULL'); });
  it('executes attachment FTS triggers in the real schema', () => { expect(SCHEMA).toContain('new.file_name'); expect(SCHEMA).toContain('new.mime_type'); expect(SCHEMA).toContain('new.notes'); expect(SCHEMA).toContain("'attachment'"); });
});
