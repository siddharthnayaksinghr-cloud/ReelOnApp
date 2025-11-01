import React, {useState,useEffect} from 'react';
import {View,FlatList,TextInput,TouchableOpacity,Text,StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ChatScreen({route}){
  const { receiverId, receiverName } = route.params || {};
  const currentUser = auth().currentUser;
  if(!receiverId){
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:'#fff'}}>Select a chat from profile</Text></View>;
  }
  const chatId = currentUser.uid > receiverId ? `${currentUser.uid}_${receiverId}` : `${receiverId}_${currentUser.uid}`;
  const [text,setText] = useState(''); const [messages,setMessages]=useState([]);
  useEffect(()=> {
    const q = firestore().collection('chats').doc(chatId).collection('messages').orderBy('createdAt','asc');
    const unsub = q.onSnapshot(snap => setMessages(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=> unsub();
  },[]);
  const send = async ()=> {
    if(!text.trim()) return;
    await firestore().collection('chats').doc(chatId).collection('messages').add({ text:text.trim(), senderId: currentUser.uid, receiverId, createdAt: firestore.FieldValue.serverTimestamp() });
    setText('');
  };
  return (
    <View style={styles.container}>
      <FlatList data={messages} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={[styles.msgBox, item.senderId===currentUser.uid ? styles.me : styles.them ]}><Text style={{color:'#fff'}}>{item.text}</Text></View>
      )} />
      <View style={styles.inputRow}><TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Type..." placeholderTextColor="#777"/><TouchableOpacity onPress={send} style={styles.sendBtn}><Text style={{color:'#fff'}}>Send</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1912', padding: 12 },
  msgBox: { padding: 10, borderRadius: 8, marginVertical: 5, maxWidth: '75%' },
  me: { alignSelf: 'flex-end', backgroundColor: '#16A34A' },
  them: { alignSelf: 'flex-start', backgroundColor: '#1E293B' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#112', color: '#fff', padding: 8, borderRadius: 8 },
  sendBtn: { backgroundColor: '#22C55E', padding: 10, borderRadius: 8, marginLeft: 8 },
});