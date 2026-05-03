import { useNavigate } from "react-router-dom";

export default function StartPage() {
  const navigate = useNavigate();

  return (
    <div className="box-border flex h-screen w-full flex-col px-5">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-[108px]">
          <img
            src="/start-image.svg"
            alt="출발 알림 이미지"
            className="mb-[13px] w-[209px]"
          />

          <h2 className="text-[23px] leading-[150%] font-semibold text-[var(--Normal)]">
            언제 나가야 해?
            <br />
            이제 대신 알려드려요
          </h2>

          <p className="mt-[26px] text-[17px] leading-[155%] font-normal text-[var(--Lightgray)]">
            일정을 입력하면
            <br />
            출발 타이밍을 자동으로 계산해요
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/notification-setting-1")}
          className="h-[62px] w-full cursor-pointer rounded-[10px] bg-[var(--GreenNormal)] text-[17px] font-semibold text-white transition-colors duration-200 hover:bg-[#4fb65e]"
        >
          + &nbsp; 첫 알림 만들기
        </button>
      </div>
    </div>
  );
}
