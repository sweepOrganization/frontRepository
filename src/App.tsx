import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotificationSetting3Page from "./pages/NotificationSetting3Page";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import PushTestPage from "./pages/PushTestPage";
import NotificationSetting4Page from "./pages/NotificationSetting4Page";

function RootPage() {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return <HomePage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/push-test" element={<PushTestPage />} />
      <Route
        path="/notification-setting-3"
        element={<NotificationSetting3Page />}
      />
      <Route
        path="/notification-setting-4"
        element={<NotificationSetting4Page />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
