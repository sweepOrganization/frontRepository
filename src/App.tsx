import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
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
      <Route path="/push-test" element={<PushTestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
    </Routes>
  );
}

export default App;
