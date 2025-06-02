// src/services/firebase.service.ts
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// just for example, you can use a different service for WhatsApp
// WhatsApp API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const verifyFirebaseToken = async (firebaseToken: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification error:', error);
    throw new Error('Invalid Firebase token');
  }
};

export const getPhoneNumberFromFirebaseUid = async (uid: string): Promise<string | null> => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord.phoneNumber || null;
  } catch (error) {
    console.error('Error fetching user from Firebase:', error);
    return null;
  }
};

export const sendWhatsAppVerificationCode = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    if (!WHATSAPP_API_URL || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp API configuration missing');
    }

    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'verification_code',
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: code
                }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('WhatsApp message sending error:', error);
    return false;
  }
};

