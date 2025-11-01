import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { mediaDevices, RTCPeerConnection, RTCView, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { PermissionsAndroid } from 'react-native';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function CallScreen({ route, navigation }) {
  const { mode, callId: incomingCallId } = route.params || {};
  const pc = useRef(null);
  const localStreamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(incomingCallId || null);

  useEffect(()=>{ (async ()=>{
    try{
      if(Platform.OS==='android'){
        const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
        if (granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED || granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permissions required');
          return;
        }
      }
      const stream = await mediaDevices.getUserMedia({ audio:true, video:true });
      localStreamRef.current = stream; setLocalStream(stream);
      pc.current = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      stream.getTracks().forEach(t=>pc.current.addTrack(t, stream));
      pc.current.ontrack = (ev)=>{ if(ev.streams && ev.streams[0]) setRemoteStream(ev.streams[0]); };
      if(mode==='create') await createCall(); else if(mode==='join' && incomingCallId) await joinCall(incomingCallId);
    }catch(e){ Alert.alert('Call init failed', e.message || String(e)); }
  })(); return ()=>cleanup(); },[]);

  const createCall = async ()=>{
    const callDoc = firestore().collection('calls').doc();
    setCurrentCallId(callDoc.id);
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');
    pc.current.onicecandidate = (event)=>{ if(event.candidate) offerCandidates.add(event.candidate.toJSON()); };
    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type, callerUid: auth().currentUser.uid };
    await callDoc.set({ offer, createdAt: firestore.FieldValue.serverTimestamp() });
    callDoc.onSnapshot(snapshot=>{ const data = snapshot.data(); if(data?.answer && !pc.current.currentRemoteDescription){ const answerDesc = new RTCSessionDescription(data.answer); pc.current.setRemoteDescription(answerDesc).catch(console.warn); } });
    answerCandidates.onSnapshot(snap=>snap.docChanges().forEach(change=>{ if(change.type==='added'){ pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data())); } }));
  };

  const joinCall = async (callId)=>{
    const callDoc = firestore().collection('calls').doc(callId);
    setCurrentCallId(callId);
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');
    pc.current.onicecandidate = (event)=>{ if(event.candidate) answerCandidates.add(event.candidate.toJSON()); };
    offerCandidates.onSnapshot(snap=>snap.docChanges().forEach(change=>{ if(change.type==='added'){ pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data())); } }));
    const callData = (await callDoc.get()).data();
    if(!callData?.offer){ Alert.alert('Call not available'); return; }
    const offerDesc = new RTCSessionDescription(callData.offer);
    await pc.current.setRemoteDescription(offerDesc);
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    const answerData = { sdp: answer.sdp, type: answer.type, calleeUid: auth().currentUser.uid };
    await callDoc.update({ answer: answerData });
  };

  const hangUp = async ()=>{
    try{
      if(currentCallId){
        const callDoc = firestore().collection('calls').doc(currentCallId);
        const offerC = await callDoc.collection('offerCandidates').get();
        const answerC = await callDoc.collection('answerCandidates').get();
        const batch = firestore().batch();
        offerC.forEach(d=>batch.delete(d.ref));
        answerC.forEach(d=>batch.delete(d.ref));
        batch.delete(callDoc);
        await batch.commit();
      }
    }catch(e){ console.warn(e); } finally { cleanup(); navigation.goBack(); }
  };

  const cleanup = ()=>{ try{ pc.current?.close(); }catch(e){} pc.current=null; if(localStreamRef.current){ localStreamRef.current.getTracks().forEach(t=>t.stop()); localStreamRef.current=null; setLocalStream(null);} setRemoteStream(null); };

  return (
    <View style={styles.container}>
      {remoteStream ? <RTCView streamURL={remoteStream.toURL()} style={styles.remote} /> : <View style={styles.placeholder}><Text style={{color:'#fff'}}>Waiting...</Text></View>}
      {localStream && <RTCView streamURL={localStream.toURL()} style={styles.local} />}
      <TouchableOpacity onPress={hangUp} style={styles.hang}><Text style={{color:'#fff'}}>End Call</Text></TouchableOpacity>
      <Text style={styles.callId}>Call ID: {currentCallId || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0B1912'},
  remote:{flex:1,width:'100%'},
  placeholder:{flex:1,justifyContent:'center',alignItems:'center'},
  local:{position:'absolute',right:12,top:12,width:120,height:160,borderWidth:2,borderColor:'#22C55E',borderRadius:8},
  hang:{position:'absolute',bottom:30,alignSelf:'center',backgroundColor:'#ef4444',padding:12,borderRadius:30},
  callId:{position:'absolute',bottom:8,alignSelf:'center',color:'#fff'}
});