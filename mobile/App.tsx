import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  Button,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { config } from './config';

const App = () => {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestFCMPermissions = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message:
                'This app needs notification permission to receive alerts.',
              buttonPositive: 'Allow',
            },
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return false;
          }
        }
      }
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (err) {
      console.error('Error requesting FCM permissions:', err);
      return false;
    }
  };

  const initFCM = async () => {
    const granted = await requestFCMPermissions();
    if (!granted) {
      setPermissionDenied(true);
      return;
    }

    setPermissionDenied(false);

    try {
      const token = await messaging().getToken();
      axios.defaults.headers.common['Content-Type'] = 'application/json';
      await axios.post(`${config.apiBaseUrl}/registerToken`, { token });
    } catch (err) {
      console.error('FCM token registration failed:', err);
    }
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Unable to open settings');
    });
  };

  useEffect(() => {
    initFCM();

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a message',
      );
    });

    const appStateSubscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          initFCM();
        }
      },
    );

    return () => {
      unsubscribeForeground();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {permissionDenied ? (
        <>
          <Text style={styles.title}>🔒 Permission Denied</Text>
          <Text style={styles.text}>
            Notifications are disabled. Please enable them in app settings.
          </Text>
          <Button title="Open App Settings" onPress={openAppSettings} />
        </>
      ) : (
        <>
          <Text style={styles.title}>👋 Hello User, Welcome!</Text>
          <Text style={styles.text}>
            ✅ Your device token has been sent to the server.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default App;
