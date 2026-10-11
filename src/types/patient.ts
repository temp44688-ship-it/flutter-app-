export type BiologicalSex = 'female' | 'male' | 'intersex' | 'unspecified';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
export interface PatientProfile { id: string; givenName: string; familyName: string; birthDateMs: number | null; biologicalSex: BiologicalSex | null; bloodGroup: BloodGroup; majorAllergies: string | null; phone: string | null; email: string | null; emergencyContactName: string | null; emergencyContactPhone: string | null; notes: string | null; createdAtMs: number; updatedAtMs: number; deletedAtMs: number | null; }
export type CreatePatientProfile = Omit<PatientProfile, 'id' | 'createdAtMs' | 'updatedAtMs' | 'deletedAtMs' | 'bloodGroup' | 'majorAllergies'> & { bloodGroup?: BloodGroup; majorAllergies?: string | null };
export type UpdatePatientProfile = Partial<CreatePatientProfile>;
