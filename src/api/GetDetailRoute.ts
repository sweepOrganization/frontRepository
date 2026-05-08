type GetDetailRouteParams = {
  routeId: number | string;
  type: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  arrivalTime: string;
};

export async function getDetailRoute({
  routeId,
  type,
  startLat,
  startLon,
  endLat,
  endLon,
  arrivalTime,
}: GetDetailRouteParams) {
  const accessToken = localStorage.getItem("accessToken");

  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL이 설정되지 않았습니다.");
  }
  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }
  if (!routeId) {
    throw new Error("routeId가 없습니다.");
  }

  const query =
    `type=${encodeURIComponent(type)}` +
    `&startLat=${encodeURIComponent(String(startLat))}` +
    `&startLon=${encodeURIComponent(String(startLon))}` +
    `&endLat=${encodeURIComponent(String(endLat))}` +
    `&endLon=${encodeURIComponent(String(endLon))}` +
    `&arrivalTime=${encodeURIComponent(arrivalTime)}`;

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/route/detail/${routeId}?${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("경로 상세 조회 요청이 실패했습니다.");
  }

  return response.json();
}
