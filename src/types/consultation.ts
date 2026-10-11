export interface Disease { id: string; name: string; description: string | null; createdAtMs: number; updatedAtMs: number; }
export interface Consultation { id: string; patientId: string; physicianName: string; specialty: string; reason: string; diagnosis: string | null; notes: string | null; consultationDateMs: number; createdAtMs: number; updatedAtMs: number; diseaseIds: string[]; }
export type NewDisease = Pick<Disease, 'name' | 'description'>;
export type NewConsultation = Pick<Consultation, 'patientId' | 'physicianName' | 'specialty' | 'reason' | 'diagnosis' | 'notes' | 'consultationDateMs'>;
