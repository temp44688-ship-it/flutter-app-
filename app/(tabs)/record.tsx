import React from 'react';
import { ConsultationsScreen } from '../../src/components/consultations/ConsultationsScreen';
import { CURRENT_PATIENT_ID } from '../../src/constants/navigation';
export default function RecordRoute() { return <ConsultationsScreen patientId={CURRENT_PATIENT_ID} />; }
