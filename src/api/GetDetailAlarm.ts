export async function getDetailAlarm({ alarmId }: { alarmId: number }) {
  const accessToken = localStorage.getItem("accessToken");

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
        segments?: unknown;
      };
      const rawSegments = parsedRouteData.segments;
      const segments =
        Array.isArray(rawSegments) && Array.isArray(rawSegments[1])
          ? rawSegments[1]
          : Array.isArray(rawSegments)
            ? rawSegments
            : [];

      data.data.routeSegments = segments;
    } catch {
      data.data.routeSegments = [];
    }
  } else {
    data.data.routeSegments = [];
  }

  return data;
}
