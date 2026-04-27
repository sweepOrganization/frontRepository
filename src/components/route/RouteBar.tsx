type RouteBarProps = {
  segments: Array<{
    distance?: number;
    sectionTime?: number;
    trafficType?: number;
    lineName?: string;
    subwayCode?: number;
    busNo?: string;
    busType?: number;
  }>;
};

function getSubwayColorClass(subwayCode?: number) {
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

  if (subwayCode && subwayColorClassMap[subwayCode]) {
    return subwayColorClassMap[subwayCode];
  }

  return "bg-(--DarkGray)";
}

function getBusColorClass(busType?: number) {
  // 확실하지 않은 색상 추후 변경 필요
  const busColorClassMap: Record<number, string> = {
    1: "bg-(--bus-gray)", // 일반
    2: "bg-(--bus-red)", // 광역
    3: "bg-(--bus-sky)", // 마을
    4: "bg-(--bus-red)", // 직행좌석(광역 계열)
    5: "bg-(--bus-gray)", // 공항
    6: "bg-(--bus-blue)", // 간선
    10: "bg-(--bus-gray)", // 외곽
    11: "bg-(--bus-blue)", // 간선(세종)
    12: "bg-(--bus-green)", // 지선
    13: "bg-(--bus-yellow)", // 순환
    14: "bg-(--bus-red)", // 광역
    15: "bg-(--bus-navy)", // 급행/심야 계열
    16: "bg-(--bus-blue)", // 간선급행
    20: "bg-(--bus-gray)", // 농어촌
    22: "bg-(--bus-sky)", // 마을버스
    26: "bg-(--bus-blue)", // 급행간선
  };

  if (typeof busType === "number" && busColorClassMap[busType]) {
    return busColorClassMap[busType];
  }
  //버스색 예외처리
  return "bg-(--bus-gray)";
}

function getSegmentColorClass(segment: RouteBarProps["segments"][number]) {
  if (segment.trafficType === 3) {
    return "bg-[#e4e4e4]";
  }

  if (segment.trafficType === 1) {
    return getSubwayColorClass(segment.subwayCode);
  }

  if (segment.trafficType === 2) {
    return getBusColorClass(segment.busType);
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
        const hasIcon = segment.trafficType === 1 || segment.trafficType === 2;
        const sectionTimeTextColorClass =
          segment.trafficType === 3 ? "text-(--LightGray)" : "text-white";
        const sectionTimePositionClass = hasIcon
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
                    src="/SubwayIcon.svg"
                    alt="subway"
                    className="h-4 w-4 shrink-0"
                  />
                </div>
              )}

              {segment.trafficType === 2 && (
                <div
                  className={`absolute top-1/2 left-0 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-[6px] ${segmentColorClass}`}
                >
                  <img
                    src="/BusIcon.svg"
                    alt="bus"
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
