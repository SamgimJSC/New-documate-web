import { useEffect, useState } from "react";
import { ToastProvider } from "./components/common/Toast";
import AppRouter from "./routes/AppRouter";
import { userService } from "./services/userService";
import { useUserStore } from "./store/userStore";

function App() {
  const [authReady, setAuthReady] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    userService.getMe()
      .then(setUser)
      .catch(() => { /* 미로그인 상태 — 로그인 페이지로 라우터가 처리 */ })
      .finally(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return null;
  }

  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;
