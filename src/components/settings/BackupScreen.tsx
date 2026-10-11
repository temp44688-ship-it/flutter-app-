import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBackup } from '../../hooks/useBackup';

export function BackupScreen() {
  const { isLoading, error, success, exportBackup, importBackup } = useBackup();
  const confirmRestore = () => Alert.alert('Attention : restauration destructive', 'Cette action remplacera toutes vos données actuelles. Voulez-vous continuer ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Choisir une sauvegarde', style: 'destructive', onPress: () => void importBackup() }]);
  return <View style={styles.container}>
    <Text style={styles.title} allowFontScaling>Backup et restauration</Text>
    <Text style={styles.help} allowFontScaling>Votre sauvegarde reste chiffrée par SQLCipher. La restauration n’est acceptée que si elle correspond à la clé de ce coffre.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Exporter la sauvegarde chiffrée" disabled={isLoading} onPress={() => void exportBackup()} style={styles.button}><Text style={styles.buttonText} allowFontScaling>Exporter ma sauvegarde</Text></Pressable>
    <View style={styles.warning}><Text style={styles.warningTitle} allowFontScaling>Attention</Text><Text style={styles.warningText} allowFontScaling>Cette action remplacera toutes vos données actuelles. Vérifiez d’abord que le fichier provient de ce coffre.</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Restaurer une sauvegarde" disabled={isLoading} onPress={confirmRestore} style={[styles.button, styles.restore]}><Text style={styles.buttonText} allowFontScaling>Restaurer une sauvegarde</Text></Pressable>
    {isLoading && <Text style={styles.status} accessibilityLiveRegion="polite" allowFontScaling>Opération en cours…</Text>}
    {success && <Text style={styles.success} accessibilityLiveRegion="polite" allowFontScaling>{success}</Text>}
    {error && <Text style={styles.error} accessibilityLiveRegion="assertive" allowFontScaling>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 18, backgroundColor: '#F8FAFC' }, title: { fontSize: 28, fontWeight: '700', color: '#172033' }, help: { fontSize: 18, lineHeight: 27, color: '#334155' }, button: { minHeight: 56, borderRadius: 12, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }, restore: { backgroundColor: '#B45309' }, buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' }, warning: { borderWidth: 2, borderColor: '#F59E0B', borderRadius: 12, padding: 16, backgroundColor: '#FFFBEB' }, warningTitle: { color: '#92400E', fontSize: 20, fontWeight: '700' }, warningText: { color: '#78350F', fontSize: 17, lineHeight: 25, marginTop: 6 }, status: { fontSize: 17, color: '#475569' }, success: { fontSize: 17, color: '#166534', fontWeight: '700' }, error: { fontSize: 17, color: '#B91C1C', fontWeight: '700' } });
