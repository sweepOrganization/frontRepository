import { Route, Routes } from "react-router-dom";
import "./App.css";
import PushTestPage from "./pages/PushTestPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/push-test" element={<PushTestPage />} />
    </Routes>
  );
}

export default App;
