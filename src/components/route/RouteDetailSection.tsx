import { useEffect, useMemo, useRef, useState } from "react";
import useGetDetailRoute from "../../hooks/queries/useGetDetailRoute";
import useRouteBarMetrics from "../../hooks/useRouteBarMetrics";
import {
  formatActualTime,
  formatDepartureHourMinute,
  formatRemainTime,
  formatSubwayLineName,
  formatWayName,
  getBracketMessage,
  splitArrivalMessage,
} from "../../utils/route/format";
import {
  buildBusArrivalsByBusNo,
  buildSegmentDepartureTimeByIndex,
  buildSegmentWayNameByIndex,
  getRemainingCountdownText,
  isBusRateLimitedMessage,
} from "../../utils/route/realtime";
import {
  normalizeBusDisplayName,
  splitBusNos,
  toBusTypeByBusNo,
  toDisplayRouteSegments,
  toSegments,
} from "../../utils/route/segment";
import {
  getBusColorClass,
  getBusTextColorStyle,
  getSubwayColor,
  getSubwayTextColorStyle,
} from "../../utils/route/style";
import RouteContentSection from "./RouteContentSection";
import RouteDurationCard from "./RouteDurationCard";
import RouteVerticalBar from "./RouteVerticalBar";

type RouteDetailSectionProps = {
  requestRouteId: number;
  requestType: string;
  requestStartX: number;
  requestStartY: number;
  requestEndX: number;
  requestEndY: number;
  requestArrivalTime: string;
  requestActualTime?: number;
  displayStartName?: string;
  displayEndName?: string;
  routeSegmentsRaw?: unknown;
};

export default function RouteDetailSection({
  requestRouteId,
  requestType,
  requestStartX,
  requestStartY,
  requestEndX,
  requestEndY,
  requestArrivalTime,
  requestActualTime,
  displayStartName,
  displayEndName,
  routeSegmentsRaw,
}: RouteDetailSectionProps) {
  const routeContentRef = useRef<HTMLDivElement | null>(null);
  const transitSectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [now, setNow] = useState(() => new Date());

  const requestRouteSegments = toSegments(routeSegmentsRaw);
  const displayRouteSegments = useMemo(
    () => toDisplayRouteSegments(requestRouteSegments),
    [requestRouteSegments],
  );
  const busTypeByBusNo = useMemo(
    () => toBusTypeByBusNo(requestRouteSegments),
    [requestRouteSegments],
  );

  const { data: detailRouteData, dataUpdatedAt } = useGetDetailRoute({
    routeId: requestRouteId,
    type: requestType,
    startX: requestStartX,
    startY: requestStartY,
    endX: requestEndX,
    endY: requestEndY,
    arrivalTime: requestArrivalTime,
  });

  const segmentWayNameByIndex = useMemo(() => {
    return buildSegmentWayNameByIndex(
      detailRouteData,
      requestRouteSegments,
      formatWayName,
    );
  }, [detailRouteData, requestRouteSegments]);

  const busArrivalsByBusNo = useMemo(() => {
    return buildBusArrivalsByBusNo(detailRouteData);
  }, [detailRouteData]);

  const segmentDepartureTimeByIndex = useMemo(() => {
    return buildSegmentDepartureTimeByIndex(
      detailRouteData,
      requestRouteSegments,
    );
  }, [detailRouteData, requestRouteSegments]);

  const getMappedValueFromSources = (
    sourceIndices: number[],
    map: Record<number, string>,
  ) => {
    for (const sourceIndex of sourceIndices) {
      const value = map[sourceIndex];
      if (value) return value;
    }
    return "";
  };

  const { routeBarHeight, transitBarSections } = useRouteBarMetrics({
    routeContentRef,
    transitSectionRefs,
    displayRouteSegments,
    displayStartName,
    displayEndName,
    getBusColorClass,
    getSubwayColor,
  });

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <RouteDurationCard
        actualTime={requestActualTime}
        formatActualTime={formatActualTime}
      />

      <div className="flex gap-[18px]">
        <RouteVerticalBar
          routeBarHeight={routeBarHeight}
          transitBarSections={transitBarSections}
        />
        <RouteContentSection
          routeContentRef={routeContentRef}
          transitSectionRefs={transitSectionRefs}
          displayStartName={displayStartName}
          displayEndName={displayEndName}
          displayRouteSegments={displayRouteSegments}
          segmentWayNameByIndex={segmentWayNameByIndex}
          segmentDepartureTimeByIndex={segmentDepartureTimeByIndex}
          busTypeByBusNo={busTypeByBusNo}
          busArrivalsByBusNo={busArrivalsByBusNo}
          now={now}
          dataUpdatedAt={dataUpdatedAt}
          getBusTextColorStyle={getBusTextColorStyle}
          getBusColorClass={getBusColorClass}
          getSubwayColor={getSubwayColor}
          getSubwayTextColorStyle={getSubwayTextColorStyle}
          splitBusNos={splitBusNos}
          normalizeBusDisplayName={normalizeBusDisplayName}
          getMappedValueFromSources={getMappedValueFromSources}
          formatSubwayLineName={formatSubwayLineName}
          formatDepartureHourMinute={formatDepartureHourMinute}
          getRemainingCountdownText={getRemainingCountdownText}
          formatRemainTime={formatRemainTime}
          splitArrivalMessage={splitArrivalMessage}
          isBusRateLimitedMessage={isBusRateLimitedMessage}
          getBracketMessage={getBracketMessage}
        />
      </div>
    </div>
  );
}
