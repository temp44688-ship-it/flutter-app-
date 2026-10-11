import React from 'react';
import { router } from 'expo-router';
import { SecurityScreen } from '../../../src/components/settings/SecurityScreen';
export default function SecurityRoute() { return <SecurityScreen onWiped={() => router.replace('/onboarding')} />; }
