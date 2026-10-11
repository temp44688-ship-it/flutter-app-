export type MedicationStatus = 'ACTIVE' | 'STOPPED' | 'COMPLETED';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string | null;
  status: MedicationStatus;
  startDateMs: number;
  endDateMs: number | null;
  notes: string | null;
  supersedesId: string | null;
  createdAtMs: number;
  updatedAtMs: number;
  stoppedAtMs: number | null;
}

export type NewMedication = Pick<Medication, 'patientId' | 'name' | 'dosage' | 'frequency' | 'route' | 'notes'>;
export type MedicationChange = Partial<Pick<Medication, 'name' | 'dosage' | 'frequency' | 'route' | 'notes'>>;
