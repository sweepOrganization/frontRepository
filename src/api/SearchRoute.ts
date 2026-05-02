import { useAlarmStore } from "../stores/useAlarmStore";

export type PathType = "PATH_TYPE_SUBWAY" | "PATH_TYPE_BUS";

export async function searchRoute(pathType: PathType) {
  const accessToken = localStorage.getItem("accessToken");
  const { arrivalTime, startLat, startLon, endLat, endLon } =
    useAlarmStore.getState();

  if (
    !arrivalTime ||
    startLat == null ||
    startLon == null ||
    endLat == null ||
    endLon == null
  ) {
    throw new Error(
      "경로 조회에 필요한 출발지/도착지 좌표 또는 도착 시간이 없습니다.",
    );
  }
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/route/boarding?arrivalTime=${encodeURIComponent(arrivalTime)}&startLat=${startLat}&startLon=${startLon}&endLat=${endLat}&endLon=${endLon}&type=${pathType}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();
  return data;
}
