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
  return data;
}
