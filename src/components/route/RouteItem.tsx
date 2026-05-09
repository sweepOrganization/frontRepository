import type { BoardingInfo, Segment } from "../../types/route";
import RouteBar from "./RouteBar";

type DurationPart = { value: number; unit: string };

type RouteItemProps = {
  index: number;
  routeId?: number | null;
  payment?: number;
  segments?: Segment[];
  boardingInfo?: BoardingInfo;
  recommendedDepartureTime?: string;
  isSelected: boolean;
  onClick: () => void;
};

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const nextHours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}:${String(seconds ?? 0).padStart(2, "0")}`;
}

function formatKoreanTime(time: string) {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const meridiem = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${meridiem} ${hour12}:${String(minutes).padStart(2, "0")}`;
}

function getDurationParts(totalMinutes: number): DurationPart[] {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  const parts: DurationPart[] = [];

  if (hours > 0) {
    parts.push({ value: hours, unit: "시간" });
  }

  if (minutes > 0 || hours === 0) {
    parts.push({ value: minutes, unit: "분" });
  }

  return parts;
}

function getSegmentsTotalMinutes(segments: Segment[]) {
  return segments.reduce((sum, segment) => {
    const sectionTime = Number(segment.sectionTime ?? 0);
    return sum + (Number.isFinite(sectionTime) ? Math.max(0, sectionTime) : 0);
  }, 0);
}

function getDeduplicatedSegments(segments: Segment[]) {
  return segments.filter((segment, index) => {
    if (segment.trafficType !== 2) {
      return true;
    }

    const prev = segments[index - 1];
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
}

function getSubwayIconColor(transportId?: string) {
  if (!transportId) return "#8a8f98";
  if (transportId.includes("GTX-A")) return "#905A89";
  if (transportId.includes("공항")) return "#73B6E4";
  if (transportId.includes("자기부상")) return "#73B6E4";
  if (transportId.includes("경의중앙")) return "#76BC9E";
  if (transportId.includes("에버")) return "#77C371";
  if (transportId.includes("경춘")) return "#08AF7B";
  if (transportId.includes("신분당")) return "#A71E31";
  if (transportId.includes("의정부")) return "#FF9D27";
  if (transportId.includes("경강")) return "#2673F2";
  if (transportId.includes("우이")) return "#C6C100";
  if (transportId.includes("서해")) return "#8BC53F";
  if (transportId.includes("김포")) return "#96710A";
  if (transportId.includes("수인") || transportId.includes("분당"))
    return "#EBA900";
  if (transportId.includes("신림")) return "#4E67A5";
  if (transportId.includes("인천 1")) return "#6F99D0";
  if (transportId.includes("인천 2")) return "#F4AB3E";
  if (transportId.includes("1")) return "#0052A4";
  if (transportId.includes("2")) return "#00A84D";
  if (transportId.includes("3")) return "#EF7C1C";
  if (transportId.includes("4")) return "#00A5DE";
  if (transportId.includes("5")) return "#996CAC";
  if (transportId.includes("6")) return "#CD7C2F";
  if (transportId.includes("7")) return "#747F00";
  if (transportId.includes("8")) return "#E6186C";
  if (transportId.includes("9")) return "#D1A62C";
  return "#8a8f98";
}

function formatStationName(name?: string) {
  if (!name) return "";
  return name.endsWith("역") ? name : `${name}역`;
}

function normalizeBusStopName(name?: string) {
  if (!name) return "";
  return name.replace(/^\(임시\)/, "").trim();
}

function normalizeBusRouteName(name?: string) {
  if (!name) return "";
  return name.replace(/\(.*\)/, "").trim();
}

function getBusIconColor(busType?: number) {
  const busColorMap: Record<number, string> = {
    1: "#53B332",
    2: "#0B57D0",
    3: "#53B332",
    4: "#E53935",
    5: "#42A5F5",
    11: "#0B57D0",
    12: "#53B332",
    14: "#E53935",
  };

  if (typeof busType === "number" && busColorMap[busType]) {
    return busColorMap[busType];
  }
  return "#8a8f98";
}

export default function RouteItem({
  index,
  routeId,
  payment,
  segments = [],
  boardingInfo,
  recommendedDepartureTime = "00:00:00",
  isSelected,
  onClick,
}: RouteItemProps) {
  const deduplicatedSegments = getDeduplicatedSegments(segments);
  const segmentsTotalMinutes = getSegmentsTotalMinutes(deduplicatedSegments);
  const arrivalTime = addMinutesToTime(
    recommendedDepartureTime,
    segmentsTotalMinutes,
  );
  const durationParts = getDurationParts(segmentsTotalMinutes);
  const subwayBoardingStops =
    boardingInfo?.segmentBoardingInfos?.filter(
      (info) => info.trafficType === 1 && Boolean(info.stopOrStation),
    ) ?? [];
  const busBoardingStops =
    boardingInfo?.segmentBoardingInfos?.filter(
      (info) => info.trafficType === 2 && Boolean(info.stopOrStation),
    ) ?? [];
  const groupedBusBoardingStops = busBoardingStops.reduce<
    Array<{ stopOrStation: string; transportIds: string[] }>
  >((acc, info) => {
    const stop = normalizeBusStopName(info.stopOrStation);
    if (!stop) return acc;

    const transportId = info.transportId?.trim();
    const lastGroup = acc[acc.length - 1];

    if (lastGroup && lastGroup.stopOrStation === stop) {
      if (transportId && !lastGroup.transportIds.includes(transportId)) {
        lastGroup.transportIds.push(transportId);
      }
      return acc;
    }

    acc.push({
      stopOrStation: stop,
      transportIds: transportId ? [transportId] : [],
    });
    return acc;
  }, []);
  const busTypeByRouteName = segments.reduce<Record<string, number>>(
    (acc, segment) => {
      if (segment.trafficType !== 2 || !segment.busNo) return acc;
      const key = normalizeBusRouteName(segment.busNo);
      if (!key || typeof segment.busType !== "number") return acc;
      if (acc[key] == null) {
        acc[key] = segment.busType;
      }
      return acc;
    },
    {},
  );

  return (
    <div
      key={`route-${index}-${String(routeId)}-${recommendedDepartureTime}`}
      onClick={onClick}
      className={`flex flex-col gap-3 rounded-[10px] border px-5 pt-[22px] pb-5 ${
        isSelected
          ? "min-h-[186px] border-(--GreenNormal)"
          : "h-[114px] border-gray-300"
      }`}
    >
      <div className="flex h-[20px] items-end gap-1">
        {durationParts.map((part, partIndex) => (
          <div
            key={`duration-${index}-${partIndex}`}
            className="flex h-[20px] items-end"
          >
            <span className="text-[26px] leading-[20px] font-bold">
              {part.value}
            </span>
            <span className="relative top-px text-[17px] leading-[20px]">
              {part.unit}
            </span>
          </div>
        ))}
      </div>
      <div className="text-[12px] text-(--Gray)">
        {formatKoreanTime(recommendedDepartureTime)} -{" "}
        {formatKoreanTime(arrivalTime)}
        {typeof payment === "number"
          ? ` | ${payment.toLocaleString("ko-KR")}원`
          : ""}
      </div>
      <RouteBar segments={deduplicatedSegments} />
      <div className="mt-5">
        {isSelected && subwayBoardingStops.length > 0 && (
          <div className="flex flex-col gap-[18px]">
            {subwayBoardingStops.map((info, stopIndex) => (
              <div
                key={`subway-stop-${index}-${stopIndex}-${info.stopOrStation}`}
                className="flex items-center gap-2"
              >
                <div className="relative flex w-4 justify-center">
                  <svg
                    width="9"
                    height="10"
                    viewBox="0 0 9 10"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0"
                    style={{ color: getSubwayIconColor(info.transportId) }}
                    fill="currentColor"
                    aria-label="subway"
                    role="img"
                  >
                    <path d="M3.05566 8.57129L2.71484 8.87109H6.28613L5.95801 8.57129H3.05566ZM1.77832 5.73828C1.42641 5.73842 1.14062 6.0224 1.14062 6.37305C1.14065 6.72368 1.42642 7.00767 1.77832 7.00781C2.13034 7.00781 2.416 6.72376 2.41602 6.37305C2.41602 6.02231 2.13035 5.73828 1.77832 5.73828ZM7.22168 5.73828C6.86965 5.73828 6.58398 6.02231 6.58398 6.37305C6.584 6.72376 6.86966 7.00781 7.22168 7.00781C7.57359 7.00768 7.85935 6.72368 7.85938 6.37305C7.85938 6.0224 7.5736 5.73842 7.22168 5.73828ZM2.15723 0.967773C1.48348 0.967773 0.9375 1.51136 0.9375 2.18262V3.82031C0.937582 4.08093 1.14991 4.29297 1.41211 4.29297L7.58789 4.29199C7.85014 4.29199 8.0625 4.08062 8.0625 3.81934V2.18262C8.0625 1.51136 7.51652 0.967773 6.84277 0.967773H2.15723ZM8.62598 10H7.58789L7.05957 9.54199H1.94043L1.41309 10H0.375L2.02148 8.57129H1.54004C1.4931 8.57129 1.44674 8.5686 1.40039 8.56445L0.943359 8.45215C0.389149 8.21932 0 7.67302 0 7.03613V1.53516C0 0.68736 0.690077 0 1.54102 0H7.45996C8.31086 4.11247e-05 9.00098 0.687385 9.00098 1.53516V7.03613C9.00098 7.68725 8.59298 8.24246 8.01855 8.46582L7.55469 8.56641C7.52328 8.56819 7.49098 8.57129 7.45898 8.57129H6.97949L8.62598 10Z" />
                  </svg>
                  {stopIndex < subwayBoardingStops.length - 1 && (
                    <span className="absolute top-4 h-5 w-px bg-[#d3d6da]" />
                  )}
                </div>
                <span className="text-[13px] leading-[16px] text-(--DarkGray)">
                  <span
                    className="font-bold"
                    style={{ color: getSubwayIconColor(info.transportId) }}
                  >
                    {formatStationName(info.stopOrStation)}
                  </span>{" "}
                  <span className="text-black">{info.transportId}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {isSelected && groupedBusBoardingStops.length > 0 && (
          <div className="flex flex-col gap-[18px]">
            {groupedBusBoardingStops.map((group, stopIndex) => (
              <div
                key={`bus-stop-${index}-${stopIndex}-${group.stopOrStation}`}
                className="flex items-center gap-2"
              >
                <div className="relative flex w-4 justify-center">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0"
                    style={{
                      color: getBusIconColor(
                        busTypeByRouteName[
                          normalizeBusRouteName(group.transportIds[0])
                        ],
                      ),
                    }}
                    fill="currentColor"
                    aria-label="bus"
                    role="img"
                  >
                    <path d="M10 2.32143V3.48214C10 3.58476 9.95987 3.68317 9.88842 3.75573C9.81698 3.82828 9.72008 3.86905 9.61905 3.86905C9.51801 3.86905 9.42112 3.82828 9.34967 3.75573C9.27823 3.68317 9.2381 3.58476 9.2381 3.48214V2.32143C9.2381 2.21882 9.27823 2.1204 9.34967 2.04785C9.42112 1.97529 9.51801 1.93452 9.61905 1.93452C9.72008 1.93452 9.81698 1.97529 9.88842 2.04785C9.95987 2.1204 10 2.21882 10 2.32143ZM0.380952 1.93452C0.279918 1.93452 0.183021 1.97529 0.111578 2.04785C0.0401359 2.1204 0 2.21882 0 2.32143V3.48214C0 3.58476 0.0401359 3.68317 0.111578 3.75573C0.183021 3.82828 0.279918 3.86905 0.380952 3.86905C0.481987 3.86905 0.578884 3.82828 0.650326 3.75573C0.721769 3.68317 0.761905 3.58476 0.761905 3.48214V2.32143C0.761905 2.21882 0.721769 2.1204 0.650326 2.04785C0.578884 1.97529 0.481987 1.93452 0.380952 1.93452ZM9.19048 1.54762V9.22619C9.19048 9.43142 9.11021 9.62824 8.96732 9.77336C8.82444 9.91848 8.63064 10 8.42857 10H7.66667C7.4646 10 7.2708 9.91848 7.12792 9.77336C6.98503 9.62824 6.90476 9.43142 6.90476 9.22619V8.83929H3.09524V9.22619C3.09524 9.43142 3.01497 9.62824 2.87208 9.77336C2.7292 9.91848 2.5354 10 2.33333 10H1.57143C1.36936 10 1.17557 9.91848 1.03268 9.77336C0.889796 9.62824 0.809524 9.43142 0.809524 9.22619V1.54762C0.809524 1.13717 0.970068 0.743522 1.25584 0.453287C1.54161 0.163052 1.92919 0 2.33333 0H7.66667C8.07081 0 8.45839 0.163052 8.74416 0.453287C9.02993 0.743522 9.19048 1.13717 9.19048 1.54762ZM3.85714 5.61012C3.85714 5.49534 3.82363 5.38313 3.76084 5.28769C3.69805 5.19225 3.60881 5.11787 3.50439 5.07394C3.39998 5.03001 3.28508 5.01852 3.17423 5.04091C3.06339 5.06331 2.96157 5.11858 2.88165 5.19975C2.80174 5.28091 2.74731 5.38432 2.72527 5.4969C2.70322 5.60948 2.71453 5.72617 2.75778 5.83221C2.80103 5.93826 2.87427 6.0289 2.96825 6.09267C3.06222 6.15644 3.1727 6.19048 3.28571 6.19048C3.43727 6.19048 3.58261 6.12933 3.68978 6.02049C3.79694 5.91166 3.85714 5.76404 3.85714 5.61012ZM7.28572 5.61012C7.28572 5.49534 7.2522 5.38313 7.18941 5.28769C7.12662 5.19225 7.03738 5.11787 6.93296 5.07394C6.82855 5.03001 6.71365 5.01852 6.60281 5.04091C6.49196 5.06331 6.39014 5.11858 6.31023 5.19975C6.23031 5.28091 6.17589 5.38432 6.15384 5.4969C6.13179 5.60948 6.14311 5.72617 6.18636 5.83221C6.22961 5.93826 6.30285 6.0289 6.39682 6.09267C6.49079 6.15644 6.60127 6.19048 6.71429 6.19048C6.86584 6.19048 7.01118 6.12933 7.11835 6.02049C7.22551 5.91166 7.28572 5.76404 7.28572 5.61012ZM8.42857 1.93452H1.57143V3.86905H8.42857V1.93452Z" />
                  </svg>
                  {stopIndex < groupedBusBoardingStops.length - 1 && (
                    <span className="absolute top-4 h-5 w-px bg-[#d3d6da]" />
                  )}
                </div>
                <span className="text-[13px] leading-[16px] text-(--DarkGray)">
                  {group.transportIds.map((transportId, idIndex) => (
                    <span
                      key={`bus-line-${index}-${stopIndex}-${transportId}`}
                      className="font-bold"
                      style={{
                        color: getBusIconColor(
                          busTypeByRouteName[
                            normalizeBusRouteName(transportId)
                          ],
                        ),
                      }}
                    >
                      {idIndex > 0 ? ", " : ""}
                      {transportId}
                    </span>
                  ))}{" "}
                  {group.stopOrStation}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
