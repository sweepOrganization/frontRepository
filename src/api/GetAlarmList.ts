export async function getAlarmList() {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("accessToken is missing.");
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/alarm`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("알람 목록 조회 요청이 실패했습니다.");
  }

  const data = await response.json();
  return data;
}
