import { useState } from "react";
import type { PathType } from "../api/SearchRoute";
import RouteItem from "../components/route/RouteItem";
import useSearchRouteQuery from "../hooks/queries/useSearchRouteQuery";
import { useSetAlarmRouteId } from "../stores/useAlarmStore";
import type { BoardingInfo, TrafficResponse } from "../types/route";

export default function NotificationSetting3Page() {
  const [selectedPathType, setSelectedPathType] =
    useState<PathType>("PATH_TYPE_SUBWAY");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const setAlarmRouteId = useSetAlarmRouteId();

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
              setAlarmRouteId(null);
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
              setAlarmRouteId(null);
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
        >
          경로선택
        </button>
      </div>
    </div>
  );
}
