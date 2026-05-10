export async function getDetailAlarm({ alarmId }: { alarmId: number }) {
  const accessToken = sessionStorage.getItem("accessToken");

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/alarm/${alarmId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();

  const routeDataRaw = data?.data?.routeData;
  if (typeof routeDataRaw === "string") {
    try {
      const parsedRouteData = JSON.parse(routeDataRaw) as {
        mapObj?: unknown;
        segments?: unknown;
      };
      data.data.routeMapObj =
        typeof parsedRouteData.mapObj === "string" ? parsedRouteData.mapObj : null;
      const rawSegments = parsedRouteData.segments;
      const segments =
        Array.isArray(rawSegments) && Array.isArray(rawSegments[1])
          ? rawSegments[1]
          : Array.isArray(rawSegments)
            ? rawSegments
            : [];

      data.data.routeSegments = segments;
    } catch {
      data.data.routeMapObj = null;
      data.data.routeSegments = [];
    }
  } else {
    data.data.routeMapObj = null;
    data.data.routeSegments = [];
  }

  return data;
}
