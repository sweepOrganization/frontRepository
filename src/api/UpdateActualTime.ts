import { useAlarmStore } from "../stores/useAlarmStore";

function toMinutesFromTimeString(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  const safeHour = Number(hour) || 0;
  const safeMinute = Number(minute) || 0;
  return safeHour * 60 + safeMinute;
}

function getActualTimeMinutes(edt: string, eta: string) {
  const edtMinutes = toMinutesFromTimeString(edt);
  const etaMinutes = toMinutesFromTimeString(eta);
  const diff = etaMinutes - edtMinutes;
  return diff >= 0 ? diff : diff + 24 * 60;
}

export async function updateActualTime(alarmId: number) {
  const accessToken = localStorage.getItem("accessToken");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { edt, eta } = useAlarmStore.getState();

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is missing.");
  }
  if (!accessToken) {
    throw new Error("accessToken is missing.");
  }
  if (!edt) {
    throw new Error("edt is missing.");
  }
  if (!eta) {
    throw new Error("eta is missing.");
  }

  const actualTime = getActualTimeMinutes(edt, eta);
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/alarm/update/actualTime/${alarmId}/${actualTime}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update actualTime.");
  }

  return response.json();
}
