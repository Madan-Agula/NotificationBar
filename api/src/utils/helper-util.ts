import admin from "../config/firebase";

export async function sendNotificationToDevice(
  token: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  const message = {
    token,
    data: {
      title,
      body,
      ...(data || {}),
    },
  };

  return await admin.messaging().send(message);
}
