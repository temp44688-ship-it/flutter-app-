jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildMedicalReportHtml, shareMedicalReport } from '../src/services/export/exportService';
const base = { id: 'p', givenName: '<Ada>', familyName: '& Lovelace', birthDateMs: null, biologicalSex: null, bloodGroup: 'unknown' as const, majorAllergies: null, phone: null, email: null, emergencyContactName: null, emergencyContactPhone: null, notes: null, createdAtMs: 1, updatedAtMs: 1, deletedAtMs: null };
describe('exportService', () => {
  beforeEach(() => { jest.clearAllMocks(); (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: 'file:///report.pdf' }); (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true); (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined); });
  it('renders empty sections and escapes dynamic patient values', () => { const html = buildMedicalReportHtml({ patient: base, medications: [], consultations: [] }); expect(html).toContain('&lt;Ada&gt;'); expect(html).toContain('Aucune connue'); expect(html).toContain('Aucun traitement actif.'); expect(html).toContain('Aucune consultation récente.'); });
  it('generates and shares a PDF when native sharing is available', async () => { await shareMedicalReport({ patient: base, medications: [], consultations: [] }); expect(Print.printToFileAsync).toHaveBeenCalledWith(expect.objectContaining({ html: expect.any(String) })); expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///report.pdf', expect.objectContaining({ mimeType: 'application/pdf' })); });
  it('fails clearly when native sharing is unavailable', async () => { (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false); await expect(shareMedicalReport({ patient: base, medications: [], consultations: [] })).rejects.toThrow('partage n’est pas disponible'); expect(Sharing.shareAsync).not.toHaveBeenCalled(); });
});
