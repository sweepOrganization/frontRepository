import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <div className="flex h-[56px] w-full items-center justify-between px-4 py-[16px]">
      <img
        src="/logo.png"
        alt="호다닥로고"
        className="h-[28px] w-[99px]"
        onClick={() => navigate("/")}
      />
      <div className="flex items-center gap-[10px]">
        <img src="/alarm.svg" alt="알람아이콘" className="h-[24px] w-[24px]" />
        <button className="rounded-[8px] border border-(--Lightgray) px-[14px] py-[7px] text-(--Lightgray)">
          마이페이지
        </button>
      </div>
    </div>
  );
}
