import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {

  constructor() {
    try {
      if (admin.apps.length === 0) {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        let credential;

        if (serviceAccountPath) {
          console.log(`[DEBUG] Initializing Firebase with service account: ${serviceAccountPath}`);
          credential = admin.credential.cert(serviceAccountPath);
        } else {
          console.warn('[DEBUG] FIREBASE_SERVICE_ACCOUNT_PATH not set, falling back to applicationDefault()');
          credential = admin.credential.applicationDefault();
        }

        admin.initializeApp({
          credential,
        });
        console.log('✅ Firebase Admin SDK initialized');
      }
    } catch (e) {
      console.error('❌ Firebase Admin init error:', e.message);
    }
  }

  async sendPush(token: string, message: string) {
    try {
      console.log(`[DEBUG] Sending push to token: ${token.substring(0, 10)}...`);
      const res = await admin.messaging().send({
        token,
        notification: {
          title: 'New Message',
          body: message,
        },
      });
      console.log('✅ Push notification sent successfully:', res);
      return res;
    } catch (e) {
      console.error('❌ Error sending push notification:', e.message);
      throw e;
    }
  }

}