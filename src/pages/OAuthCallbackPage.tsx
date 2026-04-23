import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromQuery = new URLSearchParams(window.location.search).get(
      "token",
    );
    const tokenFromStorage = localStorage.getItem("accessToken");

    if (tokenFromQuery) {
      localStorage.setItem("accessToken", tokenFromQuery);
      navigate("/", { replace: true });
      return;
    }

    if (tokenFromStorage) {
      navigate("/", { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [navigate]);

  return <div>로그인 처리 중...</div>;
}
