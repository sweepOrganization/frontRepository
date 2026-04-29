import { useState } from "react";
import type { PathType } from "../api/SearchRoute";
import RouteBar from "../components/route/RouteBar";
import useSearchRouteQuery from "../hooks/queries/useSearchRouteQuery";

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

type DurationPart = { value: number; unit: "시간" | "분" };

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


type Segment = {
  sectionTime?: number;
  trafficType?: number;
  lineName?: string;
  subwayCode?: number;
  busNo?: string;
  busType?: number;

  startStop?: string;
  endStop?: string;

};

type TrafficResponse = {
  routeId?: number | null;
  totalTime?: number;
  segments?: Segment[];
};

type BoardingInfo = {
  recommendedDepartureTime?: string;
};

export default function NotificationSetting3Page() {
  const [selectedPathType, setSelectedPathType] =
    useState<PathType>("PATH_TYPE_SUBWAY");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const subwayQuery = useSearchRouteQuery("PATH_TYPE_SUBWAY");
  const busQuery = useSearchRouteQuery("PATH_TYPE_BUS");

  const routeData =
    selectedPathType === "PATH_TYPE_SUBWAY" ? subwayQuery.data : busQuery.data;

  const trafficResponseList: TrafficResponse[] =
    routeData?.data?.trafficResponseList ?? [];
  const boardingInfos: BoardingInfo[] = routeData?.data?.boardingInfos ?? [];

  const selectedRouteId =
    selectedIndex !== null
      ? (trafficResponseList[selectedIndex]?.routeId ?? null)
      : null;
  const hasSelection = selectedIndex !== null;

  return (
    <div
      className="flex h-screen flex-col"
      data-selected-route-id={selectedRouteId ?? undefined}
    >


      <div className="mx-4 mt-[14px] flex flex-1 flex-col overflow-y-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
     


        <div className="mb-[45px] flex h-16 flex-col gap-[4px]">
          <span className="text-[23px] leading-[34px] font-bold">
            어떤 경로로 가시나요?
          </span>
          <span className="text-[17px] leading-[24px] text-(--DarkGray)">
            출발-도착지의 경로를 선택해주세요.
          </span>
        </div>



       

        <div className="mb-3 grid h-11 grid-cols-2 rounded-[10px] bg-[#f2f2f2] p-1">

          <button
            type="button"
            onClick={() => {
              setSelectedPathType("PATH_TYPE_SUBWAY");
              setSelectedIndex(null);
            }}

            className={`h-[36px] w-full appearance-none rounded-[8px] border-0 p-0 text-[14px] leading-[14px] font-semibold ${

              selectedPathType === "PATH_TYPE_SUBWAY"
                ? "bg-white text-black"
                : "text-(--DarkGray)"
            }`}
          >
            지하철
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPathType("PATH_TYPE_BUS");
              setSelectedIndex(null);
            }}

            className={`h-[36px] w-full appearance-none rounded-[8px] border-0 p-0 text-[14px] leading-[14px] font-semibold ${

              selectedPathType === "PATH_TYPE_BUS"
                ? "bg-white text-black"
                : "text-(--DarkGray)"
            }`}
          >
            버스
          </button>
        </div>

        <div className="flex flex-col gap-[10px]">

          {trafficResponseList.map(({ routeId, segments = [] }, index) => {
            const isSelected = selectedIndex === index;
            const recommendedDepartureTime =
              boardingInfos[index]?.recommendedDepartureTime ?? "00:00:00";
            const deduplicatedSegments = getDeduplicatedSegments(segments);
            const segmentsTotalMinutes =
              getSegmentsTotalMinutes(deduplicatedSegments);
            const arrivalTime = addMinutesToTime(
              recommendedDepartureTime,
              segmentsTotalMinutes,
            );
            const durationParts = getDurationParts(segmentsTotalMinutes);

            return (
              <div
                key={`route-${index}-${String(routeId)}-${recommendedDepartureTime}`}
                onClick={() => {
                  setSelectedIndex((prev) => (prev === index ? null : index));
                }}
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
          })}

        </div>
      </div>

      <div>
        <div className="h-1.5 w-full rounded-full bg-[#e4e4e4]">
          <div className="h-full w-3/4 rounded-full bg-(--GreenNormal)" />
        </div>
        <button
          type="button"
          disabled={!hasSelection}
          className={`h-[67px] w-full text-[17px] font-bold ${
            !hasSelection
              ? "bg-(--GreenLight) text-[#b1d8b6]"
              : "bg-(--GreenNormal) text-white"
          }`}
        >
          경로선택
        </button>
      </div>
    </div>
  );
}
