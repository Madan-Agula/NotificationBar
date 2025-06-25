import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Button,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { config } from './config';
import { v4 as uuid } from 'uuid';

const displayNotication = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  channelId: string,
) => {
  const notificationId = remoteMessage.messageId || uuid();
  await notifee.displayNotification({
    id: notificationId,
    title: remoteMessage.data?.title as string,
    body: remoteMessage.data?.body as string,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'accept', launchActivity: 'default' },
      actions: [
        {
          title: 'Accept',
          pressAction: { id: 'accept', launchActivity: 'default' },
        },
        {
          title: 'Decline',
          pressAction: { id: 'decline', launchActivity: 'default' },
        },
      ],
      autoCancel: true,
    },
  });
};

const alertBox = (act: string) => {
  setTimeout(() => {
    Alert.alert(
      'Notification Action',
      `You selected the *${act?.toUpperCase()}* button.`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: true },
    );
  }, 50);
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await displayNotication(remoteMessage, channelId);
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS) {
    const notificationId = detail.notification?.id;
    if (notificationId) {
      await notifee.cancelNotification(notificationId);
    }
    const act = detail.pressAction?.id;
    alertBox(act ?? '');
  }
});

export default function App() {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const setupPermissions = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Allow notifications from this app?',
            buttonPositive: 'Allow',
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionDenied(true);
          return false;
        }
      }
      const status = await messaging().requestPermission();
      const ok =
        status === messaging.AuthorizationStatus.AUTHORIZED ||
        status === messaging.AuthorizationStatus.PROVISIONAL;
      setPermissionDenied(!ok);
      return ok;
    } catch (e) {
      console.error(e);
      setPermissionDenied(true);
      return false;
    }
  };

  const registerToken = async () => {
    const token = await messaging().getToken();
    await axios.post(`${config.apiBaseUrl}/registerToken`, { token });
  };

  useEffect(() => {
    setupPermissions().then(granted => {
      if (granted) registerToken();
    });

    const unsubFCM = messaging().onMessage(async remoteMessage => {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      await displayNotication(remoteMessage, channelId);
    });

    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        const act = detail.pressAction?.id;
        alertBox(act ?? '');
      }
    });

    const subAppState = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setupPermissions().then(granted =>
          granted ? registerToken() : undefined,
        );
      }
    });

    return () => {
      unsubFCM();
      unsubNotifee();
      subAppState.remove();
    };
  }, []);

  const openSettings = () =>
    Linking.openSettings().catch(() => Alert.alert('Cannot open settings'));

  return (
    <View style={styles.container}>
      {permissionDenied ? (
        <>
          <Text style={styles.title}>Permission Denied</Text>
          <Text style={styles.text}>
            Notifications are disabled. Please enable them in app settings.{' '}
          </Text>
          <Button title="Open Settings" onPress={openSettings} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Hello User, Welcome!</Text>
          <Text style={styles.text}>
            Your device token has been sent to the server.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 10 },
  text: { fontSize: 16, color: 'gray' },
});
