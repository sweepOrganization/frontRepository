// 지하철 노선명을 화면 표시용으로 정리한다.
// 예: "수도권 4호선" -> "4호선", 값이 없으면 기본 라벨 "지하철" 반환.
export function formatSubwayLineName(lineName?: string) {
  if (!lineName) return "지하철";
  return lineName.startsWith("수도권 ")
    ? lineName.replace(/^수도권\s+/, "")
    : lineName;
}

// 방향명 텍스트를 정리한다.
// 공백을 제거한 뒤 값이 있으면 "행" 접미사를 보장한다.
export function formatWayName(wayName?: string) {
  const trimmed = wayName?.trim();
  if (!trimmed) return "";
  if (trimmed.endsWith("행")) return trimmed;
  return `${trimmed}행`;
}

// "HH:mm:ss" 또는 "HH:mm" 형태 시각에서 시:분까지만 반환한다.
// 파싱이 애매한 경우에는 원본 문자열을 그대로 반환해 정보 손실을 막는다.
export function formatDepartureHourMinute(departureTime?: string) {
  if (!departureTime) return "";
  const parts = departureTime.split(":");
  if (parts.length < 2) return departureTime;
  const [hour, minute] = parts;
  return `${hour}:${minute}`;
}

// 분 단위 소요시간을 "N분" 또는 "N시간 M분" 형식으로 표시한다.
// 숫자가 아니면 "0분"을 반환한다.
export function formatActualTime(actualTime?: number) {
  if (typeof actualTime !== "number" || Number.isNaN(actualTime)) return "0분";
  if (actualTime < 60) return `${actualTime}분`;

  const hours = Math.floor(actualTime / 60);
  const minutes = actualTime % 60;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

// 도착 메시지를 "후" 기준으로 두 줄에 표시하기 좋게 분리한다.
// "N분 N초 후 [정보]" 형태에서 첫 줄과 나머지 줄을 나눌 때 사용한다.
export function splitArrivalMessage(message: string) {
  const marker = "후";
  const markerIndex = message.indexOf(marker);
  if (markerIndex < 0) {
    return { firstLine: message, secondLine: "" };
  }

  const firstLine = message.slice(0, markerIndex + marker.length).trim();
  const secondLine = message.slice(markerIndex + marker.length).trim();
  return { firstLine, secondLine };
}

// 초 단위 값을 "N분 M초" 문자열로 변환한다.
export function formatRemainTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}분 ${sec}초`;
}

// 메시지 내 대괄호 보조 텍스트를 추출한다.
// 예: "... [2번째 전]" -> "2번째 전"
export function getBracketMessage(message: string) {
  if (!message.includes("[")) return "";
  return message.split("[")[1]?.replace("]", "").trim() ?? "";
}
