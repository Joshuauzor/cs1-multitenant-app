import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

function AppInner() {
  const { auth } = useAuth();
  return auth ? <DashboardPage /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
