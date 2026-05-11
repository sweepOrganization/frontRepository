import { useParams } from "react-router-dom";
import RouteDetailSection from "../components/route/RouteDetailSection";
import RoutePreviewSection from "../components/route/RoutePreviewSection";
import RouteSummaryCard from "../components/route/RouteSummaryCard";
import useGetDetailAlarm from "../hooks/queries/useGetDetailAlarm";

export default function RoutePage() {
  const { alarmId } = useParams();
  const { data: detailAlarmData, isLoading } = useGetDetailAlarm({
    alarmId: Number(alarmId),
  });

  const alarmDetail = detailAlarmData?.data;
  const requestRouteId = alarmDetail?.routeId;
  const requestType = alarmDetail?.routeType;
  const requestStartX = alarmDetail?.startX;
  const requestStartY = alarmDetail?.startY;
  const requestEndX = alarmDetail?.endX;
  const requestEndY = alarmDetail?.endY;
  const requestArrivalTime = alarmDetail?.arrivalTime;
  const requestActualTime = alarmDetail?.actualTime;
  const displayStartName = alarmDetail?.startName;
  const displayEndName = alarmDetail?.endName;
  const mapObj =
    typeof alarmDetail?.routeMapObj === "string"
      ? alarmDetail.routeMapObj
      : null;

  const parsedArrival = requestArrivalTime
    ? new Date(requestArrivalTime)
    : null;
  const hasValidArrival =
    parsedArrival instanceof Date && !Number.isNaN(parsedArrival.getTime());
  const displayArrival = hasValidArrival ? new Date(parsedArrival) : null;
  if (displayArrival) {
    displayArrival.setMinutes(displayArrival.getMinutes() + 20);
  }
  const formattedArrivalDate = hasValidArrival
    ? displayArrival!.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : "";
  const formattedArrivalTime = hasValidArrival
    ? displayArrival!.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  const isDetailRouteParamsReady =
    typeof requestRouteId === "number" &&
    typeof requestType === "string" &&
    requestType.length > 0 &&
    typeof requestStartX === "number" &&
    typeof requestStartY === "number" &&
    typeof requestEndX === "number" &&
    typeof requestEndY === "number" &&
    typeof requestArrivalTime === "string" &&
    requestArrivalTime.length > 0;

  if (isLoading) return <div>불러오는 중...</div>;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <RoutePreviewSection
        mapObj={mapObj}
        requestStartX={requestStartX}
        requestStartY={requestStartY}
        requestEndX={requestEndX}
        requestEndY={requestEndY}
      />
      <div className="mt-5 flex min-h-0 flex-1 flex-col px-4">
        <div className="shrink-0">
          <RouteSummaryCard
            formattedArrivalDate={formattedArrivalDate}
            formattedArrivalTime={formattedArrivalTime}
            displayStartName={displayStartName}
            displayEndName={displayEndName}
          />
          <div className="-mx-4 mb-4 h-px w-screen bg-[#e4e4e4]" />
        </div>

        {isDetailRouteParamsReady ? (
          <RouteDetailSection
            requestRouteId={requestRouteId}
            requestType={requestType}
            requestStartX={requestStartX}
            requestStartY={requestStartY}
            requestEndX={requestEndX}
            requestEndY={requestEndY}
            requestArrivalTime={requestArrivalTime}
            requestActualTime={requestActualTime}
            displayStartName={displayStartName}
            displayEndName={displayEndName}
            routeSegmentsRaw={alarmDetail?.routeSegments}
          />
        ) : null}
      </div>
    </div>
  );
}
