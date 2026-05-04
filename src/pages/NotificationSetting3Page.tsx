import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PathType } from "../api/SearchRoute";
import RouteItem from "../components/route/RouteItem";
import useSearchRouteQuery from "../hooks/queries/useSearchRouteQuery";
import {
  useSetAlarmEdt,
  useSetAlarmEta,
  useSetAlarmRouteId,
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

export default function NotificationSetting3Page() {
  const navigate = useNavigate();
  const [selectedPathType, setSelectedPathType] =
    useState<PathType>("PATH_TYPE_SUBWAY");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const setAlarmRouteId = useSetAlarmRouteId();
  const setAlarmEdt = useSetAlarmEdt();
  const setAlarmEta = useSetAlarmEta();

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

        <div className="mb-3 grid h-11 grid-cols-2 rounded-[100px] bg-[#f2f2f2] p-1">
          <button
            type="button"
            onClick={() => {
              setSelectedPathType("PATH_TYPE_SUBWAY");
              setSelectedIndex(null);
              setAlarmRouteId(null);
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
          {trafficResponseList.map(({ routeId, segments = [] }, index) => (
            <RouteItem
              key={`route-item-${index}-${String(routeId)}-${
                boardingInfos[index]?.recommendedDepartureTime ?? "00:00:00"
              }`}
              index={index}
              routeId={routeId}
              segments={segments}
              boardingInfo={boardingInfos[index]}
              recommendedDepartureTime={
                boardingInfos[index]?.recommendedDepartureTime ?? "00:00:00"
              }
              isSelected={selectedIndex === index}
              onClick={() => {
                setSelectedIndex((prev) => {
                  const nextIndex = prev === index ? null : index;
                  const nextRouteId =
                    nextIndex !== null
                      ? (trafficResponseList[nextIndex]?.routeId ?? null)
                      : null;
                  setAlarmRouteId(nextRouteId);
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
