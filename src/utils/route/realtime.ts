import type {
  ArrivingBus,
  DetailRouteResponse,
  SegmentBoardingInfo,
} from "../../types/routeRealtime";
import type { RouteSegment } from "../../types/routeView";

// detail route 응답에서 첫 번째 payload의 boarding info 배열만 안전하게 뽑는다.
// 응답 구조가 비정상이거나 값이 없으면 빈 배열을 반환한다.
export function toSegmentBoardingInfos(value: unknown): SegmentBoardingInfo[] {
  const response = value as DetailRouteResponse | undefined;
  if (!response?.data?.length) return [];
  const infos = response.data[0]?.segmentBoardingInfos;
  return Array.isArray(infos) ? infos : [];
}

// HH:mm(:ss) 출발시각을 기준으로 현재 시각(nowDate)과의 차이를 계산해
// "N분 M초" 형식 문자열을 반환한다. 이미 지나간 경우 "지나감"을 반환한다.
export function getRemainingCountdownText(
  departureTime?: string,
  nowDate?: Date,
) {
  if (!departureTime || !nowDate) return "";
  const parts = departureTime.split(":").map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return "";

  const [hours, minutes, seconds = 0] = parts;
  const departure = new Date(nowDate);
  departure.setHours(hours, minutes, seconds, 0);

  const diffSeconds = Math.floor(
    (departure.getTime() - nowDate.getTime()) / 1000,
  );
  if (diffSeconds < 0) return "지나감";

  const remainMinutes = Math.floor(diffSeconds / 60);
  const remainSeconds = diffSeconds % 60;
  return `${remainMinutes}분 ${remainSeconds}초`;
}

// 버스 실시간 API의 호출 제한 메시지를 감지한다.
// 한국어/영문 제한 문구가 포함되면 true를 반환한다.
export function isBusRateLimitedMessage(message: string) {
  return (
    message.includes("Key인증실패") ||
    message.includes("LIMITED NUMBER OF SERVICE REQUESTS EXCEEDS")
  );
}

// 화면 구간 인덱스별 방향명(wayName) 매핑을 생성한다.
// route segment와 boarding info를 trafficType 순서로 맞추기 위해 커서(infoCursor)를 사용한다.
export function buildSegmentWayNameByIndex(
  detailRouteData: unknown,
  requestRouteSegments: RouteSegment[],
  formatWayName: (wayName?: string) => string,
) {
  const infos = toSegmentBoardingInfos(detailRouteData);
  const mapped: Record<number, string> = {};
  let infoCursor = 0;

  requestRouteSegments.forEach((segment, segmentIndex) => {
    if (segment.trafficType !== 1 && segment.trafficType !== 2) return;

    while (
      infoCursor < infos.length &&
      infos[infoCursor]?.trafficType !== segment.trafficType
    ) {
      infoCursor += 1;
    }

    const info = infos[infoCursor];
    if (!info) return;

    const wayName = formatWayName(info.availableTrains?.[0]?.wayName);
    if (wayName) {
      mapped[segmentIndex] = wayName;
    }

    infoCursor += 1;
  });

  return mapped;
}

// 버스번호별 도착정보 배열 매핑을 생성한다.
// 도착 메시지와 초 정보가 모두 비어있는 항목은 화면 표시 가치가 없어 제외한다.
export function buildBusArrivalsByBusNo(detailRouteData: unknown) {
  const infos = toSegmentBoardingInfos(detailRouteData);
  const mapped: Record<string, ArrivingBus[]> = {};

  infos.forEach((info) => {
    if (info.trafficType !== 2) return;
    const busNo = info.transportId?.trim();
    if (!busNo) return;

    const arrivals =
      info.arrivingBuses?.filter((bus) => {
        const message = bus.arrivalMessage?.trim() ?? "";
        return message.length > 0 || typeof bus.arrivalTimeSeconds === "number";
      }) ?? [];

    if (arrivals.length === 0) return;
    mapped[busNo] = arrivals;
  });

  return mapped;
}

// 화면 구간 인덱스별 출발시각 매핑을 생성한다.
// buildSegmentWayNameByIndex와 같은 커서 정렬 규칙을 사용해 데이터 대응을 일치시킨다.
export function buildSegmentDepartureTimeByIndex(
  detailRouteData: unknown,
  requestRouteSegments: RouteSegment[],
) {
  const infos = toSegmentBoardingInfos(detailRouteData);
  const mapped: Record<number, string> = {};
  let infoCursor = 0;

  requestRouteSegments.forEach((segment, segmentIndex) => {
    if (segment.trafficType !== 1 && segment.trafficType !== 2) return;

    while (
      infoCursor < infos.length &&
      infos[infoCursor]?.trafficType !== segment.trafficType
    ) {
      infoCursor += 1;
    }

    const info = infos[infoCursor];
    if (!info) return;

    const departureTime = info.availableTrains?.[0]?.departureTime?.trim();
    if (departureTime) {
      mapped[segmentIndex] = departureTime;
    }

    infoCursor += 1;
  });

  return mapped;
}
