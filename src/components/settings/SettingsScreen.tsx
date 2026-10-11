import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export function SettingsScreen() {
  return <View style={styles.container}>
    <Text style={styles.title} allowFontScaling>Paramètres</Text>
    <Text style={styles.help} allowFontScaling>Gérez votre coffre médical et vos sauvegardes en toute sécurité.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les sauvegardes" onPress={() => router.push('/settings/backup')} style={styles.button}><Text style={styles.buttonText} allowFontScaling>☁  Sauvegarde et restauration</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir la sécurité" onPress={() => router.push('/settings/security')} style={styles.button}><Text style={styles.buttonText} allowFontScaling>⚙  Sécurité et verrouillage</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 18, backgroundColor: '#F8FAFC' }, title: { fontSize: 30, fontWeight: '700', color: '#172033' }, help: { fontSize: 18, lineHeight: 27, color: '#334155', marginBottom: 8 }, button: { minHeight: 56, borderRadius: 12, backgroundColor: '#0F766E', justifyContent: 'center', paddingHorizontal: 18 }, buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' } });
