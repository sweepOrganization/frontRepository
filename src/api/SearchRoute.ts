export type PathType = "PATH_TYPE_SUBWAY" | "PATH_TYPE_BUS";

export async function searchRoute(pathType: PathType) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    // 임시 테스트 코드

    `${import.meta.env.VITE_API_BASE_URL}/route/boarding?arrivalTime=2026-04-29T13:00:00&startLat=37.47605&startLon=126.867911&endLat=37.3076926&endLon=126.8536674&type=${pathType}`,

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
