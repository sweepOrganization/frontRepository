type RouteSummaryCardProps = {
  formattedArrivalDate: string;
  formattedArrivalTime: string;
  displayStartName?: string;
  displayEndName?: string;
};

export default function RouteSummaryCard({
  formattedArrivalDate,
  formattedArrivalTime,
  displayStartName,
  displayEndName,
}: RouteSummaryCardProps) {
  return (
    <div className="flex flex-col gap-[14px] text-(--Gray)">
      <div className="h-12 rounded-[9px] border border-[#e4e4e4] px-4 py-[11px]">
        <div className="flex w-full items-center">
          <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
            {formattedArrivalDate}
          </span>
          <span className="h-4 w-px bg-[#a3b7a6]" />
          <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
            {formattedArrivalTime}
          </span>
        </div>
      </div>

      <div className="mb-5 h-12 rounded-[9px] border border-[#e4e4e4] px-4 py-[11px]">
        <div className="flex w-full items-center">
          <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
            {displayStartName ? displayStartName : "출발지"}
          </span>
          <img
            src="/bidirectionalarrow.svg"
            alt="출발지 도착지 방향"
            className="mx-2 h-[7px] w-[23.65px] shrink-0"
          />
          <span className="flex h-[26px] flex-1 items-center justify-center text-[17px] leading-[17px] text-(--DarkGray)">
            {displayEndName ? displayEndName : "도착지"}
          </span>
        </div>
      </div>
    </div>
  );
}
