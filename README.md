ReelOn Full Working Project (React Native)

This project uses @react-native-firebase native modules. To run on Android you must:
1. Install Node.js, Java JDK, Android Studio and Android SDK.
2. Place your real `google-services.json` into android/app/
3. Run:
   npm install
   npx pod-install (if on mac for iOS)
   npx react-native start
   npx react-native run-android

Notes:
- This project uses react-native-webrtc, expo-av, expo-image-picker. Extra native setup may be required.
- For push notifications configure Firebase Cloud Messaging and deploy the cloud function provided earlier.
- For production WebRTC, add a TURN server and update ICE_SERVERS in CallScreen.js
