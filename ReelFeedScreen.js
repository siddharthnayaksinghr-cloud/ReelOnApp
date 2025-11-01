import React, {useEffect,useState} from 'react';
import { View, FlatList, Dimensions, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Video } from 'expo-av';
import firestore from '@react-native-firebase/firestore';

const {height} = Dimensions.get('window');
export default function ReelFeedScreen({navigation}){
  const [reels,setReels]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=> {
    const q = firestore().collection('reels').orderBy('createdAt','desc');
    const unsub = q.onSnapshot(snap=>{ setReels(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false); });
    return ()=> unsub();
  },[]);
  if(loading) return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator/></View>;
  return (
    <FlatList data={reels} keyExtractor={i=>i.id} pagingEnabled renderItem={({item})=>(
      <View style={{height,backgroundColor:'#000',justifyContent:'center'}}>
        <Video source={{uri:item.videoUrl}} style={{height,width:'100%'}} resizeMode="cover" shouldPlay isLooping />
        <TouchableOpacity onPress={()=>navigation.navigate('Comments',{reelId:item.id})} style={{position:'absolute',bottom:120,left:20}}><Text style={{color:'#ECFDF5'}}>Comments</Text></TouchableOpacity>
      </View>
    )}/>
  );
}