import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import storage from '@react-native-firebase/storage';
import { auth, firestore } from '../config/firebaseConfig';

export default function ReelUploadScreen({ navigation }) {
  const [uploading, setUploading] = useState(false);

  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    if (res.canceled) return;
    const uri = res.assets[0].uri;
    uploadVideo(uri);
  };

  const uploadVideo = async (uri) => {
    try {
      const user = auth().currentUser; if(!user){ Alert.alert('Login first'); return; }
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `reels/${user.uid}_${Date.now()}.mp4`;
      const ref = storage().ref(filename);
      await ref.put(blob);
      const url = await ref.getDownloadURL();
      await firestore().collection('reels').add({ uid:user.uid, videoUrl:url, createdAt: firestore.FieldValue.serverTimestamp(), likes:0, views:0 });
      Alert.alert('Uploaded');
      navigation.goBack();
    } catch (e) { Alert.alert('Upload failed', e.message); } finally { setUploading(false); }
  };

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#0B1912'}}>
      <TouchableOpacity onPress={pickVideo} style={{backgroundColor:'#22C55E',padding:12,borderRadius:8}}><Text style={{color:'#ECFDF5'}}>Choose Video</Text></TouchableOpacity>
      {uploading && <ActivityIndicator color="#22C55E" />}
    </View>
  );
}