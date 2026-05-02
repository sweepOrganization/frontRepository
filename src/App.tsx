import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotificationSetting3Page from "./pages/NotificationSetting3Page";
import NotificationSetting4Page from "./pages/NotificationSetting4Page";
import NotificationSetting5Page from "./pages/NotificationSetting5Page";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import NotificationStep2Page from "./pages/NotificationStep2Page";
import PushTestPage from "./pages/PushTestPage";
import StartPage from "./pages/StartPage";
import NotificationSettingPage from "./pages/NotificationSettingPage";

function RootPage() {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return <HomePage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/start" element={<StartPage />} />
      <Route
        path="/notification-setting"
        element={<NotificationSettingPage />}
      />
      <Route path="/push-test" element={<PushTestPage />} />
      <Route
        path="/notification-setting-3"
        element={<NotificationSetting3Page />}
      />

      <Route
        path="/notification-setting-4"
        element={<NotificationSetting4Page />}
      />

      <Route
        path="/notification-setting-5"
        element={<NotificationSetting5Page />}
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/notification-step2" element={<NotificationStep2Page />} />
      <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
