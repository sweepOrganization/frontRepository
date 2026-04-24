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
    <div>
      <h1>LoginPage</h1>
      <button onClick={handleKakaoLogin}>카카오로그인</button>
      <button onClick={handleGoogleLogin}>구글로그인</button>
    </div>
  );
}
