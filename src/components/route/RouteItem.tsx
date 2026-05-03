import type { BoardingInfo, Segment } from "../../types/route";
import RouteBar from "./RouteBar";

type DurationPart = { value: number; unit: string };

type RouteItemProps = {
  index: number;
  routeId?: number | null;
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
  if (transportId.includes("1")) return "#0052A4";
  if (transportId.includes("2")) return "#00A84D";
  if (transportId.includes("3")) return "#EF7C1C";
  if (transportId.includes("4")) return "#00A5DE";
  if (transportId.includes("5")) return "#996CAC";
  if (transportId.includes("6")) return "#CD7C2F";
  if (transportId.includes("7")) return "#747F00";
  if (transportId.includes("8")) return "#E6186C";
  if (transportId.includes("9")) return "#BB8336";
  return "#8a8f98";
}

function formatStationName(name?: string) {
  if (!name) return "";
  return name.endsWith("역") ? name : `${name}역`;
}

export default function RouteItem({
  index,
  routeId,
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
                  {formatStationName(info.stopOrStation)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
