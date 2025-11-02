
# ReelOnApp - Full Version (Auth, Reels, Chat, Follow, Comments, Notifications, Calls)

This is a ready project skeleton for React Native CLI (Android). It includes:
- Auth (Firebase)
- Realtime Chat (Firestore)
- Reels upload/feed (storage + Firestore references)
- Profile, Edit Profile, Follow system, Comments, Notifications skeleton
- WebRTC call screen skeleton (requires TURN for production)

IMPORTANT:
- This repo is a skeleton to get started. It uses native Firebase SDK (@react-native-firebase).
- You MUST place your `google-services.json` in `android/app/`.
- The uploaded google-services.json from you was found and copied into the project.

Run steps:
1. Install dependencies:
   npm install

2. Android:
   npx react-native start
   npx react-native run-android

3. iOS (macOS):
   cd ios
   pod install
   cd ..
   npx react-native run-ios

Notes:
- For push notifications and FCM, configure native setup (not fully covered here).
- For video upload, you will need Firebase Storage integration and permissions.
