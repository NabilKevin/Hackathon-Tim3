// import Constants from 'expo-constants';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import { Platform } from 'react-native';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// export async function registerForPushNotificationsAsync() {
//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//     });
//   }

//   if (!Device.isDevice) {
//     alert('Gunakan device fisik');
//     return null;
//   }

//   const { status: existingStatus } =
//     await Notifications.getPermissionsAsync();

//   let finalStatus = existingStatus;
//   if (existingStatus !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== 'granted') {
//     alert('Permission not granted');
//     return null;
//   }

//   const projectId =
//     Constants.expoConfig?.extra?.eas?.projectId ??
//     Constants.easConfig?.projectId;

//   const token = (
//     await Notifications.getExpoPushTokenAsync({ projectId })
//   ).data;

//   return token;
// }
