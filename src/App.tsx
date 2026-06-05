import { ToastProvider } from "./components/common/Toast";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;
