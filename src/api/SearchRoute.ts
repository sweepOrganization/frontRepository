export async function searchRoute() {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/route/boarding?arrivalTime=2026-04-29T13:00:00&startLat=126.867911&startLon=37.47605&endLat=126.8536674&endLon=37.3076926&type=PATH_TYPE_SUBWAY`,
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
