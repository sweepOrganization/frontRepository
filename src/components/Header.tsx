export default function Header() {
  return (
    <div className="flex h-[56px] w-full items-center justify-between px-4 py-[16px]">
      <img src="/logo.png" alt="logo" className="h-[28px] w-[99px]" />
      <div className="flex items-center gap-[10px]">
        <img src="/alarm.svg" alt="알람아이콘" className="h-[24px] w-[24px]" />
        <button className="rounded-[8px] border border-(--Lightgray) px-[14px] py-[7px] text-(--Lightgray)">
          마이페이지
        </button>
      </div>
    </div>
  );
}
