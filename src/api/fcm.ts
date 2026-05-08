export const postFcmToken = async (token: string) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("액세스 토큰을 찾을 수 없습니다.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/fcm/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `FCM 토큰 저장에 실패했습니다. (status: ${response.status})`,
    );
  }

  const raw = await response.text();
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    console.log("서버 응답:", data);
    return data;
  } catch {
    console.log("서버 응답(텍스트):", raw);
    return raw;
  }
};
