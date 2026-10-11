import React from 'react';
import { MedicationsScreen } from '../../src/components/medications/MedicationsScreen';
import { CURRENT_PATIENT_ID } from '../../src/constants/navigation';
export default function MedicationsRoute() { return <MedicationsScreen patientId={CURRENT_PATIENT_ID} />; }
