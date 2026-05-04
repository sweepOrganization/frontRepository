import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import FcmAutoRegistration from "./components/fcm/FcmAutoRegistration";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotificationSetting1Page from "./pages/NotificationSetting1Page";
import { default as NotificationSetting2Page } from "./pages/NotificationSetting2Page";
import NotificationSetting3Page from "./pages/NotificationSetting3Page";
import NotificationSetting4Page from "./pages/NotificationSetting4Page";
import NotificationSetting5Page from "./pages/NotificationSetting5Page";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import StartPage from "./pages/StartPage";

function RootPage() {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return <HomePage />;
}

function App() {
  return (
    <>
      <FcmAutoRegistration />
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route
          path="/notification-setting-1"
          element={<NotificationSetting1Page />}
        />
        <Route
          path="/notification-setting-2"
          element={<NotificationSetting2Page />}
        />
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
        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
