// File: src/services/sms.service.ts
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

export const sendVerificationSMS = async (phoneNumber: string, code: string): Promise<void> => {
  if (!client || !twilioPhoneNumber) {
    console.log(`SMS verification code for ${phoneNumber}: ${code}`);
    return;
  }
  
  await client.messages.create({
    body: `Your verification code is: ${code}`,
    from: twilioPhoneNumber,
    to: phoneNumber
  });
};