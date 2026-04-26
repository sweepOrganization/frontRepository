import { useState, useEffect } from "react";
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

  const slides = [
    {
      image: "/onboarding-01.svg",
      title: "준비 시작부터\n출발 시간 알람까지",
      desc: "내가 설정한 준비 시간부터\n반복 알림으로 늦지 않게 도와줘요",
    },
    {
      image: "/onboarding-02.svg",
      title: "출발지와 도착지\n최적의 경로 안내",
      desc: "이동 시간을 최적의 경로로 계산해\n딱 맞는 출발 시간을 알려드려요",
    },
    {
      image: "/onboarding-03.svg",
      title: "이제 지각 걱정은\n그만!",
      desc: "호다닥이 출발 시간을\n미리 알려드릴게요",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const loginButtonClass =
    "h-[62px] rounded-[10px] text-[var(--Neutral)] text-[17px] font-semibold flex items-center justify-center gap-[10px] cursor-pointer";

  return (
    <div className="box-border flex h-screen w-full flex-col justify-center px-5">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-[180px] w-[320px]">
          {slides.map((slide, i) => (
            <img
              key={slide.image}
              src={slide.image}
              alt="온보딩 이미지"
              className={`slide-img ${i === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>

        <h2 className="slide-title">{slides[currentIndex].title}</h2>
        <p className="slide-desc">{slides[currentIndex].desc}</p>

        <div className="dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[14px]">
        <button
          className={`${loginButtonClass} bg-[#fee500]`}
          onClick={handleKakaoLogin}
        >
          <img src="/kakao-icon.svg" alt="kakao" className="h-6 w-6" />
          카카오톡 로그인
        </button>

        <button
          className={`${loginButtonClass} bg-[#f4f4f4]`}
          onClick={handleGoogleLogin}
        >
          <img src="/google-icon.svg" alt="google" className="h-6 w-6" />
          구글 로그인
        </button>
      </div>
    </div>
  );
}
