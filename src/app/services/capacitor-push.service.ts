import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class CapacitorPushService {
  constructor() {}

  async init(): Promise<void> {
    try {
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        console.warn('Push permission not granted');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration token:', token.value);
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration error:', err);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed:', action);
      });
    } catch (e) {
      console.warn('Push init failed', e);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const perm = await PushNotifications.checkPermissions();
      if (perm.receive !== 'granted') return null;
      // Token is provided in the 'registration' listener — keep track if needed
      return null;
    } catch {
      return null;
    }
  }
}
