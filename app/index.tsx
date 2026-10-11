import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SecurePatientsScreen } from '../src/components/patients/SecurePatientsScreen';
import { useOnboarding } from '../src/hooks/useOnboarding';
export default function EntryScreen() { const onboarding = useOnboarding(); if (onboarding.isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator accessibilityLabel="Chargement" /></View>; if (!onboarding.complete) return <Redirect href="/onboarding" />; return <SecurePatientsScreen onUnlocked={() => router.replace('/(tabs)')} />; }
