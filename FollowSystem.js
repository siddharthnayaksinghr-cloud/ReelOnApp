import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const followUser = async (targetUid) => {
  const currentUid = auth().currentUser.uid;
  if (currentUid === targetUid) return;
  await firestore().collection('users').doc(currentUid).update({ following: firestore.FieldValue.arrayUnion(targetUid) });
  await firestore().collection('users').doc(targetUid).update({ followers: firestore.FieldValue.arrayUnion(currentUid) });
};

export const unfollowUser = async (targetUid) => {
  const currentUid = auth().currentUser.uid;
  await firestore().collection('users').doc(currentUid).update({ following: firestore.FieldValue.arrayRemove(targetUid) });
  await firestore().collection('users').doc(targetUid).update({ followers: firestore.FieldValue.arrayRemove(currentUid) });
};