import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          name: "New User",
          bio: "Hey there! I’m on ReelOn 🎬"
        });

        setMessage('✅ Signup successful and saved to Firestore!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('✅ Login successful!');
      }
    } catch (error) {
      setMessage('❌ ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ReelOn</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title={isSignup ? "Sign Up" : "Login"} onPress={handleAuth} />
      <Text style={{ marginTop: 20, color: '#fff' }}>{message}</Text>
      <Text
        style={{ marginTop: 10, color: '#FFB86B' }}
        onPress={() => setIsSignup(!isSignup)}
      >
        {isSignup ? "Already have an account? Login" : "New here? Sign Up"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#0F1724', padding: 20 },
  title: { fontSize: 28, color: '#FF4D6D', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, padding: 12 },
});
