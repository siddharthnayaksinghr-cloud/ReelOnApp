import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 ReelOn App</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ReelFeed')}><Text style={styles.btnText}>Watch Reels</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ReelUpload')}><Text style={styles.btnText}>Upload Reels</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Profile')}><Text style={styles.btnText}>My Profile</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1912' },
  title: { fontSize: 26, color: '#22C55E', fontWeight: 'bold', marginBottom: 30 },
  btn: {
    backgroundColor: '#22C55E',
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});