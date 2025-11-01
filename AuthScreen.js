import React, {useState} from 'react';
import {View,TextInput,TouchableOpacity,Text,StyleSheet,Alert} from 'react-native';
import { auth, firestore } from '../config/firebaseConfig';

export default function AuthScreen({navigation}){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [isSignup,setIsSignup] = useState(false);

  const handleAuth = async ()=>{
    try{
      if(isSignup){
        const userCred = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCred.user;
        await firestore().collection('users').doc(user.uid).set({
          uid: user.uid, email: user.email, name: 'New User', createdAt: firestore.FieldValue.serverTimestamp()
        });
      } else {
        await auth().signInWithEmailAndPassword(email, password);
      }
      navigation.replace('Home');
    }catch(e){
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ReelOn</Text>
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize='none' />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btn} onPress={handleAuth}><Text style={styles.btnText}>{isSignup?'Sign Up':'Login'}</Text></TouchableOpacity>
      <Text style={styles.toggle} onPress={()=>setIsSignup(!isSignup)}>{isSignup? 'Have account? Login':'New? Sign Up'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1912' },
  title: { color: '#22C55E', fontSize: 40, fontWeight: 'bold', marginBottom: 40 },
  input: {
    width: '80%',
    backgroundColor: '#112',
    color: '#fff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  btn: { backgroundColor: '#22C55E', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: { color: '#22C55E', marginTop: 20 },
});