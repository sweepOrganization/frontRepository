export default function TimeBanner() {
  return (
    <div className="mb-10 flex h-[102px] flex-col gap-1 rounded-[10px] bg-(--GreenNormal) px-6 py-4 text-white">
      <span className="text-[17px] leading-[17px] text-(--GreenLightActive)">
        출발시간
      </span>
      <div className="flex items-end justify-between">
        <span className="text-[49px] leading-[49px] font-medium">15:50</span>
        <span className="text-[17px] leading-[17px]">도착시간 17:00</span>
      </div>
    </div>
  );
}
