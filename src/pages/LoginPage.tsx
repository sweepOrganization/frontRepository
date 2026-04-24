export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href =
      "https://sweepmap.duckdns.org/oauth2/authorization/kakao";
  };
  return (
    <div>
      <h1>LoginPage</h1>
      <button onClick={handleKakaoLogin}>카카오로그인</button>
    </div>
  );
}
