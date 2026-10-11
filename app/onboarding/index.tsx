import React from 'react';
import { router } from 'expo-router';
import { OnboardingFlow } from '../../src/components/onboarding/OnboardingFlow';
export default function OnboardingRoute() { return <OnboardingFlow onComplete={() => router.replace('/')} />; }
