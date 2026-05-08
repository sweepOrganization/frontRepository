export async function deleteAlarm({ alarmId }: { alarmId: number }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${baseUrl}/alarm/${alarmId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
}
