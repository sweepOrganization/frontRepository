import type { Segment } from "../../types/route";
import RouteBar from "./RouteBar";

type DurationPart = { value: number; unit: string };

type RouteItemProps = {
  index: number;
  routeId?: number | null;
  segments?: Segment[];
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

export default function RouteItem({
  index,
  routeId,
  segments = [],
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

  return (
    <div
      key={`route-${index}-${String(routeId)}-${recommendedDepartureTime}`}
      onClick={onClick}
      className={`flex flex-col gap-3 rounded-[10px] border px-5 pt-[22px] pb-5 ${
        isSelected
          ? "h-[186px] border-(--GreenNormal)"
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
    </div>
  );
}
