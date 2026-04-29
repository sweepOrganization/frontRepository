type RouteBarProps = {
  segments: Array<{
    distance?: number;
    sectionTime?: number;
    trafficType?: number;
    lineName?: string;
    subwayCode?: number;
    busNo?: string;
    busType?: number;

    startStop?: string;
    endStop?: string;



  }>;
};

function getSubwayColorClass(subwayCode?: number, lineName?: string) {
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
    114: "bg-(--line-seohae)",
  };

  if (subwayCode && subwayColorClassMap[subwayCode]) {
    return subwayColorClassMap[subwayCode];
  }

  if (lineName?.includes("공항")) return "bg-(--line-airport)";
  if (lineName?.includes("경의중앙")) return "bg-(--line-gyeongui)";
  if (lineName?.includes("경춘")) return "bg-(--line-gyeongchun)";

  if (lineName?.includes("수인.분당")) return "bg-(--line-su-in-bundang)";

  if (lineName?.includes("신분당")) return "bg-(--line-sinbundang)";
  if (lineName?.includes("경강")) return "bg-(--line-gyeonggang)";
  if (lineName?.includes("서해")) return "bg-(--line-seohae)";
  if (lineName?.includes("인천 1")) return "bg-(--line-incheon-1)";
  if (lineName?.includes("인천 2")) return "bg-(--line-incheon-2)";
  if (lineName?.includes("에버")) return "bg-(--line-ever)";
  if (lineName?.includes("의정부")) return "bg-(--line-uijeongbu)";
  if (lineName?.includes("우이")) return "bg-(--line-ui-sinseol)";
  if (lineName?.includes("김포")) return "bg-(--line-gimpo-gold)";
  if (lineName?.includes("신림")) return "bg-(--line-sillim)";
  if (lineName?.includes("GTX-A")) return "bg-(--line-gtx-a)";

  return "bg-(--DarkGray)";
}

function getBusColorClass(busType?: number) {


  const busColorClassMap: Record<number, string> = {
    1: "bg-(--bus-green)", //일반
    3: "bg-(--bus-green)", //마을
    4: "bg-(--bus-red)", //직행좌석
    5: "bg-(--bus-sky)", //공항
    11: "bg-(--bus-blue)", //간선
    12: "bg-(--bus-green)", //지선
    14: "bg-(--bus-red)", //광역


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
    return getSubwayColorClass(segment.subwayCode, segment.lineName);
  }

  if (segment.trafficType === 2) {
    return getBusColorClass(segment.busType);
  }

  return "bg-(--DarkGray)";
}

export default function RouteBar({ segments }: RouteBarProps) {
  const normalizedSegments = segments.map((segment) => ({
    ...segment,
    sectionTime: Number(segment.sectionTime ?? 0),
  }));

  const visibleSegments = normalizedSegments.filter((segment) => {
    const sectionTime = segment.sectionTime ?? 0;
    return sectionTime > 0;
  });



  const originalSegments =
    visibleSegments.length > 0 ? visibleSegments : normalizedSegments;

  // 같은 출발/도착 정류장으로 가는 연속 버스 대안은 경로바에서 1개만 표시
  const deduplicatedSegments = originalSegments.filter((segment, index) => {
    if (segment.trafficType !== 2) {
      return true;
    }

    const prev = originalSegments[index - 1];
    if (!prev || prev.trafficType !== 2) {
      return true;
    }

    const hasSameStops =
      Boolean(segment.startStop) &&
      Boolean(segment.endStop) &&
      segment.startStop === prev.startStop &&
      segment.endStop === prev.endStop;

    return !hasSameStops;
  });

  return (
    <div className="flex items-center">
      {deduplicatedSegments.map((segment, index) => {


  // API 값 이슈로 모두 필터링되는 경우를 대비해 fallback 렌더링
  const renderSegments =
    visibleSegments.length > 0 ? visibleSegments : normalizedSegments;

  return (
    <div className="flex items-center">
      {renderSegments.map((segment, index) => {



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
