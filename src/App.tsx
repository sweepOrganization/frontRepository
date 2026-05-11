import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import BackHeader from "./components/common/BackHeader";
import Header from "./components/common/Header";
import Splash from "./components/common/Splash";
import FcmAutoRegistration from "./components/fcm/FcmAutoRegistration";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotificationSetting1Page from "./pages/NotificationSetting1Page";
import { default as NotificationSetting2Page } from "./pages/NotificationSetting2Page";
import NotificationSetting3Page from "./pages/NotificationSetting3Page";
import NotificationSetting4Page from "./pages/NotificationSetting4Page";
import NotificationSetting5Page from "./pages/NotificationSetting5Page";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import RoutePage from "./pages/RoutePage";
import StartPage from "./pages/StartPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function WithHeader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full">
        <Header />
      </div>
      {children}
    </>
  );
}

function WithBackHeader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full">
        <BackHeader />
      </div>
      {children}
    </>
  );
}

function App() {
  const [isMinSplashElapsed, setIsMinSplashElapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("hasSeenSplash") === "true";
  });
  const [isAppLoaded, setIsAppLoaded] = useState(
    document.readyState === "complete",
  );

  useEffect(() => {
    const handleLoaded = () => {
      setIsAppLoaded(true);
    };

    if (!isAppLoaded) {
      window.addEventListener("load", handleLoaded);
    }

    return () => {
      window.removeEventListener("load", handleLoaded);
    };
  }, [isAppLoaded]);

  useEffect(() => {
    if (isMinSplashElapsed) return;

    const timerId = window.setTimeout(() => {
      setIsMinSplashElapsed(true);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isMinSplashElapsed]);

  if (!(isMinSplashElapsed && isAppLoaded)) return <Splash />;

  return (
    <>
      <FcmAutoRegistration />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WithHeader>
                <HomePage />
              </WithHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/start"
          element={
            <ProtectedRoute>
              <WithHeader>
                <StartPage />
              </WithHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-setting-1"
          element={
            <ProtectedRoute>
              <WithBackHeader>
                <NotificationSetting1Page />
              </WithBackHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-setting-2"
          element={
            <ProtectedRoute>
              <WithBackHeader>
                <NotificationSetting2Page />
              </WithBackHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-setting-3"
          element={
            <ProtectedRoute>
              <WithBackHeader>
                <NotificationSetting3Page />
              </WithBackHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-setting-4"
          element={
            <ProtectedRoute>
              <WithBackHeader>
                <NotificationSetting4Page />
              </WithBackHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-setting-5"
          element={
            <ProtectedRoute>
              <WithBackHeader>
                <NotificationSetting5Page />
              </WithBackHeader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/route/:alarmId"
          element={
            <ProtectedRoute>
              <WithHeader>
                <RoutePage />
              </WithHeader>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
