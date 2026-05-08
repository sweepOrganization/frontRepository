import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PathType } from "../api/SearchRoute";
import RouteItem from "../components/route/RouteItem";
import useSearchRouteQuery from "../hooks/queries/useSearchRouteQuery";
import {
  useSetAlarmEdt,
  useSetAlarmEta,
  useSetAlarmRouteId,
  useSetAlarmRoutePreviewId,
} from "../stores/useAlarmStore";
import type { BoardingInfo, TrafficResponse } from "../types/route";

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours = "0", minutes = "0", seconds = "0"] = time.split(":");
  const safeHours = Number(hours) || 0;
  const safeMinutes = Number(minutes) || 0;
  const safeSeconds = Number(seconds) || 0;
  const totalMinutes = safeHours * 60 + safeMinutes + Math.max(0, minutesToAdd);
  const nextHours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}:${String(safeSeconds).padStart(2, "0")}`;
}

function getDeduplicatedSegments(segments: TrafficResponse["segments"] = []) {
  return segments.filter((segment, index) => {
    if (segment.trafficType !== 2) return true;

    const prev = segments[index - 1];
    if (!prev || prev.trafficType !== 2) return true;

    const hasSameStops =
      Boolean(segment.startStop) &&
      Boolean(segment.endStop) &&
      segment.startStop === prev.startStop &&
      segment.endStop === prev.endStop;

    return !hasSameStops;
  });
}

function getSegmentsTotalMinutes(segments: TrafficResponse["segments"] = []) {
  return segments.reduce((sum, segment) => {
    const sectionTime = Number(segment.sectionTime ?? 0);
    return sum + (Number.isFinite(sectionTime) ? Math.max(0, sectionTime) : 0);
  }, 0);
}

export default function NotificationSetting3Page() {
  const navigate = useNavigate();
  const [selectedPathType, setSelectedPathType] =
    useState<PathType>("PATH_TYPE_SUBWAY");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const setAlarmRouteId = useSetAlarmRouteId();
  const setAlarmRoutePreviewId = useSetAlarmRoutePreviewId();
  const setAlarmEdt = useSetAlarmEdt();
  const setAlarmEta = useSetAlarmEta();

  const subwayQuery = useSearchRouteQuery("PATH_TYPE_SUBWAY");
  const busQuery = useSearchRouteQuery("PATH_TYPE_BUS");

  const routeData =
    selectedPathType === "PATH_TYPE_SUBWAY" ? subwayQuery.data : busQuery.data;

  const trafficResponseList: TrafficResponse[] =
    routeData?.data?.trafficResponseList ?? [];
  const boardingInfos: BoardingInfo[] = routeData?.data?.boardingInfos ?? [];
  const sortedRoutes = useMemo(() => {
    return trafficResponseList
      .map((route, originalIndex) => {
        const deduplicatedSegments = getDeduplicatedSegments(route.segments);
        const totalMinutes = getSegmentsTotalMinutes(deduplicatedSegments);

        return {
          route,
          boardingInfo: boardingInfos[originalIndex],
          originalIndex,
          totalMinutes,
        };
      })
      .sort((a, b) => a.totalMinutes - b.totalMinutes);
  }, [trafficResponseList, boardingInfos]);
  const visibleRoutes = showAllRoutes ? sortedRoutes : sortedRoutes.slice(0, 5);
  const hasMoreRoutes = sortedRoutes.length > 5;

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
          <span className="text-[23px] leading-[34px] font-semibold">
            어떤 경로로 가시나요?
          </span>
          <span className="text-[17px] leading-[24px] text-(--Lightgray)">
            출발→도착지의 경로를 선택해주세요.
          </span>
        </div>

        <div className="mb-3 grid h-11 grid-cols-2 rounded-[100px] bg-[#f2f2f2] p-1">
          <button
            type="button"
            onClick={() => {
              setSelectedPathType("PATH_TYPE_SUBWAY");
              setSelectedIndex(null);
              setAlarmRouteId(null);
              setAlarmRoutePreviewId(null);
              setAlarmEdt("");
              setAlarmEta("");
            }}
            className={`h-[36px] w-full appearance-none rounded-[100px] border p-0 text-[14px] leading-[14px] font-semibold ${
              selectedPathType === "PATH_TYPE_SUBWAY"
                ? "border-(--GreenNormal) bg-white text-(--GreenNormalActive)"
                : "border-transparent text-(--DarkGray)"
            }`}
          >
            지하철
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPathType("PATH_TYPE_BUS");
              setSelectedIndex(null);
              setAlarmRouteId(null);
              setAlarmRoutePreviewId(null);
              setAlarmEdt("");
              setAlarmEta("");
            }}
            className={`h-[36px] w-full appearance-none rounded-[100px] border p-0 text-[14px] leading-[14px] font-semibold ${
              selectedPathType === "PATH_TYPE_BUS"
                ? "border-(--GreenNormal) bg-white text-(--GreenNormalActive)"
                : "border-transparent text-(--DarkGray)"
            }`}
          >
            버스
          </button>
        </div>

        <div className="flex flex-col gap-[10px]">
          {visibleRoutes.map(({ route, boardingInfo, originalIndex }) => (
            <RouteItem
              key={`route-item-${originalIndex}-${String(route.routeId)}-${
                boardingInfo?.recommendedDepartureTime ?? "00:00:00"
              }`}
              index={originalIndex}
              routeId={route.routeId}
              segments={route.segments ?? []}
              boardingInfo={boardingInfo}
              recommendedDepartureTime={
                boardingInfo?.recommendedDepartureTime ?? "00:00:00"
              }
              isSelected={selectedIndex === originalIndex}
              onClick={() => {
                setSelectedIndex((prev) => {
                  const nextIndex =
                    prev === originalIndex ? null : originalIndex;
                  const nextRouteId =
                    nextIndex !== null
                      ? (trafficResponseList[nextIndex]?.routeId ?? null)
                      : null;
                  const nextRoutePreviewId =
                    nextIndex !== null
                      ? (trafficResponseList[nextIndex]?.routePreviewId ?? null)
                      : null;
                  setAlarmRouteId(nextRouteId);
                  setAlarmRoutePreviewId(nextRoutePreviewId);
                  if (nextIndex !== null) {
                    const selectedBoardingInfo = boardingInfos[nextIndex];
                    const edt =
                      selectedBoardingInfo?.recommendedDepartureTime ??
                      "00:00:00";
                    const selectedRoute = trafficResponseList[nextIndex];
                    const totalMinutesFromRoute = Number(
                      selectedRoute?.totalTime,
                    );
                    const selectedSegments = selectedRoute?.segments ?? [];
                    const totalMinutesFromSegments = selectedSegments.reduce(
                      (sum, segment) =>
                        sum +
                        Math.max(
                          0,
                          Number.isFinite(Number(segment.sectionTime))
                            ? Number(segment.sectionTime)
                            : 0,
                        ),
                      0,
                    );
                    const totalMinutes =
                      selectedPathType === "PATH_TYPE_SUBWAY"
                        ? totalMinutesFromSegments
                        : Number.isFinite(totalMinutesFromRoute)
                          ? Math.max(0, totalMinutesFromRoute)
                          : totalMinutesFromSegments;
                    setAlarmEdt(edt);
                    setAlarmEta(addMinutesToTime(edt, totalMinutes));
                  } else {
                    setAlarmEdt("");
                    setAlarmEta("");
                  }
                  return nextIndex;
                });
              }}
            />
          ))}
          {!showAllRoutes && hasMoreRoutes && (
            <button
              type="button"
              onClick={() => setShowAllRoutes(true)}
              className="mt-1 self-center text-[12px] leading-[12px] text-(--Lightgray) underline underline-offset-2"
            >
              더보기
            </button>
          )}
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
          onClick={() => {
            navigate("/notification-setting-4");
          }}
        >
          경로선택
        </button>
      </div>
    </div>
  );
}
