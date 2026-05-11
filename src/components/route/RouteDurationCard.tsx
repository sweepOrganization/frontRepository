type RouteDurationCardProps = {
  actualTime?: number;
  formatActualTime: (actualTime?: number) => string;
};

export default function RouteDurationCard({
  actualTime,
  formatActualTime,
}: RouteDurationCardProps) {
  return (
    <div className="my-[32px] flex h-[80px] w-full flex-col rounded-[10px] border border-(--GreenNormal) px-5 py-[10px]">
      <div className="flex h-[26px] items-center text-[17px] leading-[17px] font-semibold text-[#323232]">
        선택 경로 안내
      </div>
      <div className="flex h-[34px] items-end gap-1">
        <span className="text-[21px] leading-[21px] font-semibold text-(--Green)">
          {formatActualTime(actualTime)}
        </span>
        <span className="self-end text-[15px] leading-[15px] font-semibold text-(--Lightgray)">
          소요 예상
        </span>
      </div>
    </div>
  );
}
