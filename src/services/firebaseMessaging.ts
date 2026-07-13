import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/*
  로그인 성공 직후 호출.
  - 알림 권한 요청 → 서비스워커 활성화 대기 → FCM 토큰 발급
  - 권한 거부/미지원 브라우저면 null 반환 (호출 쪽에서 무시하면 됨)
*/
export async function requestFcmToken(): Promise<string | null> {
  if (!(await isSupported())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const registration = await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  // 탭이 열려있는 동안(포그라운드) 수신 메시지는 OS 알림으로 안 뜨므로 직접 표시
  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification ?? {};
    if (title) new Notification(title, { body, icon: "/notification-icon.png?v=3" });
  });

  return token;
}
