import "./LoginPage.css";

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href =
      "https://sweepmap.duckdns.org/oauth2/authorization/kakao";
  };
  const handleGoogleLogin = () => {
    window.location.href =
      "https://sweepmap.duckdns.org/oauth2/authorization/google";
  };
  
   return (
    <div className="login-container">
      <div className="button-group">
        <button className="kakao-btn" onClick={handleKakaoLogin}>
          <img
            src="/kakao-icon.svg"
            alt="kakao"
            className="kakao-icon"
          />
          카카오톡 로그인
        </button>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img
            src="/google-icon.svg"
            alt="google"
            className="google-icon"
          />
          구글 로그인
        </button>
      </div>
    </div>
  );
}
