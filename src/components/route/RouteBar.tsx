type RouteBarProps = {
  segments: Array<{
    distance?: number;
    sectionTime?: number;
    trafficType?: number;
    lineName?: string;
    subwayCode?: number;
  }>;
};

//도보는 e4e4e4, 지하철은 라인별 색상 적용
function getSegmentColorClass(segment: RouteBarProps["segments"][number]) {
  if (segment.trafficType === 3) {
    return "bg-[#e4e4e4]";
  }

  if (segment.trafficType === 1) {
    const subwayColorClassMap: Record<number, string> = {
      1: "bg-(--line-1)",
      2: "bg-(--line-2)",
      3: "bg-(--line-3)",
      4: "bg-(--line-4)",
      5: "bg-(--line-5)",
      6: "bg-(--line-6)",
      7: "bg-(--line-7)",
      8: "bg-(--line-8)",
      9: "bg-(--line-9)",
    };

    if (segment.subwayCode && subwayColorClassMap[segment.subwayCode]) {
      return subwayColorClassMap[segment.subwayCode];
    }
  }

  return "bg-(--DarkGray)";
}

export default function RouteBar({ segments }: RouteBarProps) {
  const visibleSegments = segments.filter((segment) => {
    const sectionTime = segment.sectionTime ?? 0;
    return sectionTime > 0;
  });

  return (
    <div className="flex items-center">
      {visibleSegments.map((segment, index) => {
        const currentSectionTime = segment.sectionTime ?? 0;
        const segmentColorClass = getSegmentColorClass(segment);
        const flexGrow = Math.max(currentSectionTime, 1);
        const sectionTimeTextColorClass =
          segment.trafficType === 3 ? "text-(--LightGray)" : "text-white";
        const sectionTimePositionClass =
          segment.trafficType === 1
            ? "absolute inset-0 box-border pl-5"
            : "absolute inset-0";

        return (
          <div
            key={`segment-${index}-${currentSectionTime}`}
            className="flex flex-1 items-center"
            style={{ flexGrow }}
          >
            <div
              className={`relative h-4 w-full min-w-4 rounded-[4px] ${segmentColorClass}`}
              title={`${currentSectionTime} min`}
            >
              <span
                className={`pointer-events-none flex items-center justify-center text-center text-[10px] leading-none ${sectionTimeTextColorClass} ${sectionTimePositionClass}`}
              >
                {currentSectionTime}분
              </span>
              {segment.trafficType === 1 && (
                <div
                  className={`absolute top-1/2 left-0 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-[6px] ${segmentColorClass}`}
                >
                  <img
                    src="/Union.svg"
                    alt="subway"
                    className="h-4 w-4 shrink-0"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
