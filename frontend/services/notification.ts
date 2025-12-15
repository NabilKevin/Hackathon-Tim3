import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { api } from './api';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert('Push notification hanya di device fisik');
    return null;
  }
}
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

export const getNotification = async (token: string, activeFilter: string) => {
  const response = await api.get(`/notifications?type=${activeFilter}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data?.data;
};