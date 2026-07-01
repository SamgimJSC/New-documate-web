import { useEffect, useState } from "react";
import { ToastProvider } from "./components/common/Toast";
import AppRouter from "./routes/AppRouter";
import { userService } from "./services/userService";
import { useUserStore } from "./store/userStore";

function App() {
  const [authReady, setAuthReady] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const stayLoggedIn = localStorage.getItem('stayLoggedIn') === 'true';
    const sessionActive = sessionStorage.getItem('sessionActive') === 'true';

    if (!stayLoggedIn && !sessionActive) {
      setAuthReady(true);
      return;
    }

    userService.getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('stayLoggedIn');
        sessionStorage.removeItem('sessionActive');
      })
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
