import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import StartPage from "./pages/StartPage";
import PushTestPage from "./pages/PushTestPage";

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
      <Route path="/push-test" element={<PushTestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
