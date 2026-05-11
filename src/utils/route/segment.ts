import type { DisplayRouteSegment, RouteSegment } from "../../types/routeView";

// 알 수 없는 입력값을 RouteSegment 배열로 안전하게 변환한다.
export function toSegments(value: unknown): RouteSegment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is RouteSegment => typeof v === "object" && v !== null,
  );
}

// 원본 구간 배열을 화면 표시용 구간 배열로 변환하고 병합 인덱스를 기록한다.
export function toDisplayRouteSegments(
  segments: RouteSegment[],
): DisplayRouteSegment[] {
  const result: DisplayRouteSegment[] = [];

  segments.forEach((segment, index) => {
    const last = result[result.length - 1];
    const canMergeBus =
      segment.trafficType === 2 &&
      last?.trafficType === 2 &&
      segment.startStop &&
      segment.endStop &&
      last.startStop === segment.startStop &&
      last.endStop === segment.endStop;

    if (!canMergeBus) {
      result.push({ ...segment, sourceIndices: [index] });
      return;
    }

    const mergedBusNos = [last.busNo, segment.busNo]
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => value.split("/").map((part) => part.trim()))
      .filter((value, i, arr) => value.length > 0 && arr.indexOf(value) === i)
      .join(" / ");

    last.busNo = mergedBusNos || last.busNo;
    last.sourceIndices.push(index);
  });

  return result;
}

// "A / B / C" 형태의 버스 번호 문자열을 중복 없는 배열로 분리한다.
export function splitBusNos(busNo?: string) {
  if (!busNo) return [];
  return busNo
    .split("/")
    .map((value) => value.trim())
    .filter(
      (value, index, arr) => value.length > 0 && arr.indexOf(value) === index,
    );
}

// 버스 표시명에서 괄호 부가정보를 제거해 UI용 이름으로 정리한다.
export function normalizeBusDisplayName(name?: string) {
  if (!name) return "";
  return name.replace(/\(.*\)/, "").trim();
}

// 버스 번호별 타입 코드를 매핑해 빠르게 조회할 수 있는 테이블을 만든다.
export function toBusTypeByBusNo(segments: RouteSegment[]) {
  const map: Record<string, number> = {};

  segments.forEach((segment) => {
    if (segment.trafficType !== 2 || typeof segment.busType !== "number") {
      return;
    }

    splitBusNos(segment.busNo).forEach((busNo) => {
      if (!map[busNo]) {
        map[busNo] = segment.busType as number;
      }
    });
  });

  return map;
}
