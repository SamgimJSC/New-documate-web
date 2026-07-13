importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

/*
  Vite는 public/ 폴더 파일에 빌드 타임 치환을 적용하지 않으므로
  env 변수 대신 값을 직접 적는다. Firebase 웹 config는 클라이언트에
  그대로 노출되는 값이라 비밀값이 아니다.
*/
firebase.initializeApp({
  apiKey: "AIzaSyBJaJHLtz7FYFr-xj2K2VyLNaNSQf_l2UY",
  authDomain: "documate-1a094.firebaseapp.com",
  projectId: "documate-1a094",
  storageBucket: "documate-1a094.firebasestorage.app",
  messagingSenderId: "517594361545",
  appId: "1:517594361545:web:4b04976fd831fea9266718",
});

const messaging = firebase.messaging();

// 탭이 백그라운드/닫혀있을 때 수신한 메시지를 OS 알림으로 표시
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "DocuMate", {
    body: body || "",
    icon: "/notification-icon.png?v=3",
  });
});
