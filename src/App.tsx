import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
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
      <Route element={<Layout />}>
        <Route path="/" element={<RootPage />} />
        <Route path="/push-test" element={<PushTestPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
