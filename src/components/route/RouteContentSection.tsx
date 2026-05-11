import type { MutableRefObject } from "react";
import type { ArrivingBus } from "../../types/routeRealtime";
import type { DisplayRouteSegment } from "../../types/routeView";

type RouteContentSectionProps = {
  routeContentRef: MutableRefObject<HTMLDivElement | null>;
  transitSectionRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
  displayStartName?: string;
  displayEndName?: string;
  displayRouteSegments: DisplayRouteSegment[];
  segmentWayNameByIndex: Record<number, string>;
  segmentDepartureTimeByIndex: Record<number, string>;
  busTypeByBusNo: Record<string, number>;
  busArrivalsByBusNo: Record<string, ArrivingBus[]>;
  now: Date;
  dataUpdatedAt: number;
  getBusTextColorStyle: (busType?: number) => { color: string };
  getBusColorClass: (busType?: number) => string;
  getSubwayColor: (subwayCode?: number) => string;
  getSubwayTextColorStyle: (subwayCode?: number) => { color: string };
  splitBusNos: (busNo?: string) => string[];
  normalizeBusDisplayName: (name?: string) => string;
  getMappedValueFromSources: (
    sourceIndices: number[],
    map: Record<number, string>,
  ) => string;
  formatSubwayLineName: (lineName?: string) => string;
  formatDepartureHourMinute: (departureTime?: string) => string;
  getRemainingCountdownText: (departureTime?: string, nowDate?: Date) => string;
  formatRemainTime: (seconds: number) => string;
  splitArrivalMessage: (message: string) => { firstLine: string; secondLine: string };
  isBusRateLimitedMessage: (message: string) => boolean;
  getBracketMessage: (message: string) => string;
};

export default function RouteContentSection({
  routeContentRef,
  transitSectionRefs,
  displayStartName,
  displayEndName,
  displayRouteSegments,
  segmentWayNameByIndex,
  segmentDepartureTimeByIndex,
  busTypeByBusNo,
  busArrivalsByBusNo,
  now,
  dataUpdatedAt,
  getBusTextColorStyle,
  getBusColorClass,
  getSubwayColor,
  getSubwayTextColorStyle,
  splitBusNos,
  normalizeBusDisplayName,
  getMappedValueFromSources,
  formatSubwayLineName,
  formatDepartureHourMinute,
  getRemainingCountdownText,
  formatRemainTime,
  splitArrivalMessage,
  isBusRateLimitedMessage,
  getBracketMessage,
}: RouteContentSectionProps) {
  return (
    <div ref={routeContentRef} className="mb-18 w-full">
      <div className="flex h-[26px] items-center gap-2">
        <span className="text-[17px] leading-[17px] font-semibold text-[#323232]">
          {displayStartName}
        </span>
        <span className="text-[17px] leading-[17px] font-semibold text-[#009362]">
          출발
        </span>
      </div>

      {displayRouteSegments.map((segment, index) => {
        if (segment.trafficType === 3) {
          if ((segment.sectionTime ?? 0) <= 0) return null;
          return (
            <div key={`walk-${index}`}>
              <div className="mt-2 h-[30px] text-[15px] leading-[15px] font-semibold">
                도보{" "}
                <span className="text-[19px] leading-[19px] font-semibold text-[#323232]">
                  {segment.sectionTime ?? 0}
                </span>
                분
              </div>
              <div className="my-[10px] h-px w-full bg-[#E5E7EB]" />
            </div>
          );
        }

        if (segment.trafficType === 2) {
          return (
            <div
              key={`bus-${index}`}
              ref={(element) => {
                transitSectionRefs.current[index] = element;
              }}
            >
              <div className="mb-1 flex h-[30px] items-center text-[15px] leading-[15px] font-semibold">
                <span className="text-[19px] leading-[19px] text-[#323232]">
                  {segment.sectionTime ?? 0}
                </span>
                분
              </div>
              <div className="flex h-[26px] items-center gap-2 text-[17px] leading-[17px] font-semibold">
                <span style={getBusTextColorStyle(segment.busType)}>
                  {segment.startStop}
                </span>
                <span>승차</span>
              </div>
              {getMappedValueFromSources(
                segment.sourceIndices,
                segmentWayNameByIndex,
              ) ? (
                <div className="mt-1 text-[12px] leading-[12px] font-medium text-[#6B7280]">
                  {getMappedValueFromSources(
                    segment.sourceIndices,
                    segmentWayNameByIndex,
                  )}
                </div>
              ) : null}
              <div className="my-2 flex w-full flex-col rounded-[10px] border border-[#e4e4e4] px-5 py-[10px]">
                <div className="flex flex-col gap-2">
                  {splitBusNos(segment.busNo).map((busNo) => (
                    <div
                      key={`${index}-${busNo}`}
                      className="grid grid-cols-[auto_1fr] items-center gap-2"
                    >
                      <span
                        className={`inline-flex h-[22px] items-center justify-center rounded-[5px] px-[5px] py-[3px] text-center text-[13px] leading-[13px] font-semibold whitespace-nowrap text-white ${getBusColorClass(
                          busTypeByBusNo[busNo] ?? segment.busType,
                        )}`}
                      >
                        {normalizeBusDisplayName(busNo)}
                      </span>
                      <div className="flex w-full items-center justify-center text-center">
                        {(busArrivalsByBusNo[busNo] ?? [])
                          .slice(0, 1)
                          .map((bus, messageIndex) => {
                            const message = bus.arrivalMessage?.trim() ?? "";
                            const elapsedSeconds =
                              dataUpdatedAt > 0
                                ? Math.floor((now.getTime() - dataUpdatedAt) / 1000)
                                : 0;
                            const liveSeconds =
                              typeof bus.arrivalTimeSeconds === "number"
                                ? Math.max(0, bus.arrivalTimeSeconds - elapsedSeconds)
                                : null;
                            const isRateLimited = isBusRateLimitedMessage(message);

                            const firstLine = isRateLimited
                              ? "실시간 조회가 일시 제한되었어요."
                              : typeof liveSeconds === "number" && liveSeconds > 0
                                ? formatRemainTime(liveSeconds)
                                : message.length > 0
                                  ? splitArrivalMessage(message).firstLine
                                  : "운행정보 없음";

                            const secondLine = isRateLimited
                              ? "잠시 후 다시 시도해주세요."
                              : getBracketMessage(message);

                            return (
                              <span
                                key={`${busNo}-arrive-${messageIndex}`}
                                className="min-w-[88px] text-[15px] leading-[15px]"
                              >
                                <span className="font-bold text-[#EF4444]">{firstLine}</span>
                                {secondLine ? (
                                  <span className="ml-2 text-(--Darkgray)">{secondLine}</span>
                                ) : null}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[12px] leading-[12px] text-(--Lightgray)">
                {segment.stationCount ?? 0}개 정류장 이동
              </div>
              <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
              <div className="text-[17px] leading-[17px] font-semibold">
                {segment.endStop} 하차
              </div>
              <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
            </div>
          );
        }

        if (segment.trafficType === 1) {
          return (
            <div
              key={`subway-${index}`}
              ref={(element) => {
                transitSectionRefs.current[index] = element;
              }}
            >
              <div className="mb-1 flex h-[30px] items-center text-[15px] leading-[15px] font-semibold">
                <span className="text-[19px] leading-[19px] text-[#323232]">
                  {segment.sectionTime ?? 0}
                </span>
                분
              </div>
              <div className="flex h-[26px] items-center gap-2 text-[17px] leading-[17px] font-semibold">
                <div
                  style={{ backgroundColor: getSubwayColor(segment.subwayCode) }}
                  className="flex h-[22px] items-center justify-center rounded-[5px] px-[5px] py-[3px] text-[13px] leading-[13px] font-semibold text-white"
                >
                  {formatSubwayLineName(segment.lineName)}
                </div>
                <span style={getSubwayTextColorStyle(segment.subwayCode)}>
                  {segment.startStation}역
                </span>
                <span>승차</span>
              </div>
              {getMappedValueFromSources(
                segment.sourceIndices,
                segmentWayNameByIndex,
              ) ? (
                <div className="mt-1 text-[12px] leading-[12px] font-medium text-[#6B7280]">
                  {getMappedValueFromSources(
                    segment.sourceIndices,
                    segmentWayNameByIndex,
                  )}
                </div>
              ) : null}
              <div className="my-2 flex w-full flex-col rounded-[10px] border border-[#e4e4e4] px-5 py-[10px]">
                {getMappedValueFromSources(
                  segment.sourceIndices,
                  segmentDepartureTimeByIndex,
                ) ? (
                  <div className="grid w-full grid-cols-[auto_1fr] items-center gap-2">
                    <span className="text-[15px] leading-[15px] font-bold text-[#323232]">
                      {formatDepartureHourMinute(
                        getMappedValueFromSources(
                          segment.sourceIndices,
                          segmentDepartureTimeByIndex,
                        ),
                      )}
                    </span>
                    <span className="text-center text-[15px] leading-[15px] font-bold text-[#EF4444]">
                      {getRemainingCountdownText(
                        getMappedValueFromSources(
                          segment.sourceIndices,
                          segmentDepartureTimeByIndex,
                        ),
                        now,
                      )}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="text-[12px] leading-[12px] text-(--Lightgray)">
                {segment.stationCount ?? 0}개 역 이동
              </div>
              <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
              <div className="text-[17px] leading-[17px] font-semibold">
                {segment.endStation}역 하차
              </div>
              <div className="my-[18px] h-px w-full bg-[#E5E7EB]" />
            </div>
          );
        }

        return null;
      })}

      <div className="flex items-center gap-2 text-[17px] leading-[17px] font-semibold">
        <span>{displayEndName}</span>
        <span className="text-[#009362]">도착</span>
      </div>
    </div>
  );
}
