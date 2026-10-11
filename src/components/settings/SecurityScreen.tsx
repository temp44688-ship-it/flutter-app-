import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSecuritySettings } from '../../hooks/useSecuritySettings';

export function SecurityScreen({ onWiped }: { onWiped?: () => void }) {
  const { lockMode, biometricAvailable, isLoading, error, configureLock, wipe } = useSecuritySettings();
  const confirmWipe = () => Alert.alert('Effacer toutes mes données', 'Attention : cette action remplacera et supprimera toutes vos données actuelles. La clé de chiffrement sera détruite et cette action est irréversible.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Effacer définitivement', style: 'destructive', onPress: () => void wipe().then(() => onWiped?.()) }]);
  return <View style={styles.container}>
    <Text style={styles.title} allowFontScaling>Sécurité du coffre</Text>
    <Text style={styles.help} allowFontScaling>La biométrie utilise toujours le code de déverrouillage de votre appareil comme secours. Aucun code PIN n’est enregistré par MedHistory.</Text>
    <Text style={styles.state} allowFontScaling>État actuel : {lockMode === 'biometric-or-device-pin' ? 'Biométrie + code de l’appareil' : 'Code de l’appareil'}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Activer la biométrie" disabled={isLoading || !biometricAvailable} onPress={() => void configureLock(true)} style={styles.button}><Text style={styles.buttonText} allowFontScaling>{biometricAvailable ? 'Activer la biométrie' : 'Biométrie non disponible'}</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Utiliser uniquement le code de l’appareil" disabled={isLoading} onPress={() => void configureLock(false)} style={[styles.button, styles.secondary]}><Text style={styles.secondaryText} allowFontScaling>Utiliser le code de l’appareil</Text></Pressable>
    <View style={styles.spacer} />
    <Pressable accessibilityRole="button" accessibilityLabel="Effacer toutes mes données" disabled={isLoading} onPress={confirmWipe} style={styles.danger}><Text style={styles.dangerText} allowFontScaling>Effacer toutes mes données</Text></Pressable>
    {error && <Text style={styles.error} accessibilityLiveRegion="assertive" allowFontScaling>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 18, backgroundColor: '#F8FAFC' }, title: { fontSize: 28, fontWeight: '700', color: '#172033' }, help: { fontSize: 18, lineHeight: 27, color: '#334155' }, state: { fontSize: 18, fontWeight: '600', color: '#0F4C5C' }, button: { minHeight: 56, borderRadius: 12, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }, buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' }, secondary: { backgroundColor: '#E2E8F0' }, secondaryText: { color: '#172033', fontSize: 18, fontWeight: '700' }, spacer: { flex: 1 }, danger: { minHeight: 56, borderRadius: 12, borderWidth: 2, borderColor: '#B91C1C', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }, dangerText: { color: '#B91C1C', fontSize: 18, fontWeight: '700' }, error: { color: '#B91C1C', fontSize: 17, fontWeight: '700' } });
