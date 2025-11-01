import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { auth, firestore } from '../config/firebaseConfig';
import { followUser, unfollowUser } from '../services/FollowSystem';

export default function ProfileScreen({ route, navigation }) {
  const viewingUid = route?.params?.userId || auth().currentUser?.uid;
  const [user, setUser] = useState(null);
  const [reels, setReels] = useState([]);
  const currentUid = auth().currentUser?.uid;

  useEffect(() => {
    const unsubUser = firestore().collection('users').doc(viewingUid).onSnapshot(doc => setUser(doc.data()));
    const unsubReels = firestore().collection('reels').where('uid','==',viewingUid).orderBy('createdAt','desc').onSnapshot(snap=>setReels(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=>{unsubUser(); unsubReels();};
  },[viewingUid]);

  if(!user) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:'#fff'}}>Loading...</Text></View>;

  const isSelf = viewingUid === currentUid;
  const isFollowing = user.followers?.includes(currentUid);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{uri: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}} style={styles.avatar} />
        <Text style={styles.name}>{user.name || user.email.split('@')[0]}</Text>
        <Text style={styles.sub}>Followers: {user.followers?.length || 0}  •  Following: {user.following?.length || 0}</Text>
        {!isSelf && (isFollowing ? <TouchableOpacity onPress={()=>unfollowUser(viewingUid)} style={[styles.btn,{backgroundColor:'#ef4444'}]}><Text style={styles.btnText}>Unfollow</Text></TouchableOpacity> : <TouchableOpacity onPress={()=>followUser(viewingUid)} style={styles.btn}><Text style={styles.btnText}>Follow</Text></TouchableOpacity>)}
        {isSelf && <TouchableOpacity onPress={async()=>{await auth().signOut(); navigation.replace('Auth');}} style={[styles.btn,{backgroundColor:'#ef4444'}]}><Text style={styles.btnText}>Logout</Text></TouchableOpacity>}
      </View>

      <Text style={styles.section}>Reels</Text>
      <FlatList data={reels} keyExtractor={i=>i.id} renderItem={({item})=>(<View style={styles.reel}><Text style={{color:'#fff'}} numberOfLines={1}>{item.videoUrl}</Text></View>)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0B1912',padding:12},
  header:{alignItems:'center',marginBottom:12},
  avatar:{width:100,height:100,borderRadius:50,marginBottom:8},
  name:{color:'#22C55E',fontSize:18,fontWeight:'700'},
  sub:{color:'#ddd',marginBottom:8},
  btn:{backgroundColor:'#22C55E',padding:10,borderRadius:8,marginTop:8},
  btnText:{color:'#fff',fontWeight:'700'},
  section:{color:'#fff',fontSize:16,marginVertical:10},
  reel:{backgroundColor:'#112',padding:8,borderRadius:8,marginBottom:8}
});