import React,{useEffect,useState} from 'react';
import {View,FlatList,TextInput,TouchableOpacity,Text,StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function CommentsScreen({route}){
  const {reelId} = route.params;
  const [comment,setComment] = useState(''); const [comments,setComments] = useState([]);
  useEffect(()=> {
    const q = firestore().collection('reels').doc(reelId).collection('comments').orderBy('createdAt','asc');
    const unsub = q.onSnapshot(snap=>setComments(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=> unsub();
  },[reelId]);
  const send = async ()=> {
    if(!comment.trim()) return;
    await firestore().collection('reels').doc(reelId).collection('comments').add({
      text:comment.trim(), uid:auth().currentUser.uid, userEmail:auth().currentUser.email, createdAt: firestore.FieldValue.serverTimestamp()
    });
    setComment('');
  };
  return (
    <View style={styles.container}>
      <FlatList data={comments} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={styles.comment}><Text style={styles.email}>{item.userEmail?.split('@')[0]}</Text><Text style={styles.text}>{item.text}</Text></View>
      )} />
      <View style={styles.inputRow}><TextInput style={styles.input} placeholder="Write..." placeholderTextColor="#999" value={comment} onChangeText={setComment}/><TouchableOpacity onPress={send} style={styles.sendBtn}><Text style={{color:'#fff'}}>Send</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1912', padding: 12 },
  comment: { backgroundColor: '#112', padding: 8, borderRadius: 8, marginVertical: 6 },
  email: { color: '#22C55E', fontWeight: 'bold' },
  text: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#112', color: '#fff', padding: 8, borderRadius: 8 },
  sendBtn: { backgroundColor: '#22C55E', padding: 10, borderRadius: 8, marginLeft: 8 },
});