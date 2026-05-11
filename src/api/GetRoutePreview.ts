import type { PreviewResponse } from "../types/routePreview";

export async function getRoutePreview({
  mapObj,
}: {
  mapObj: string;
}): Promise<PreviewResponse> {
  const accessToken = sessionStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("accessToken is missing.");
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/route/preview/${encodeURIComponent(mapObj)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Route preview failed: ${res.status}`);
  }

  return (await res.json()) as PreviewResponse;
}
