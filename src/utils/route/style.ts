import {
  BUS_TYPE_COLOR_CLASS_MAP,
  BUS_TYPE_TEXT_COLOR_MAP,
  SUBWAY_CODE_COLOR_MAP,
} from "../../constants/transitColors";

// 버스 타입 코드에 맞는 Tailwind 배경 클래스명을 반환한다.
export function getBusColorClass(busType?: number) {
  if (typeof busType === "number" && BUS_TYPE_COLOR_CLASS_MAP[busType]) {
    return BUS_TYPE_COLOR_CLASS_MAP[busType];
  }

  return "bg-(--bus-gray)";
}

// 버스 타입 코드에 맞는 텍스트 색상 style 객체를 반환한다.
export function getBusTextColorStyle(busType?: number) {
  return {
    color:
      typeof busType === "number" && BUS_TYPE_TEXT_COLOR_MAP[busType]
        ? BUS_TYPE_TEXT_COLOR_MAP[busType]
        : "var(--bus-gray)",
  } as const;
}

// 지하철 노선 코드에 맞는 텍스트 색상 style 객체를 반환한다.
export function getSubwayTextColorStyle(subwayCode?: number) {
  return {
    color:
      typeof subwayCode === "number" && SUBWAY_CODE_COLOR_MAP[subwayCode]
        ? SUBWAY_CODE_COLOR_MAP[subwayCode]
        : "#4B5563",
  } as const;
}

// 지하철 노선 코드에 맞는 배경색 값을 반환한다.
export function getSubwayColor(subwayCode?: number) {
  if (typeof subwayCode === "number" && SUBWAY_CODE_COLOR_MAP[subwayCode]) {
    return SUBWAY_CODE_COLOR_MAP[subwayCode];
  }

  return "#4B5563";
}
