import { useAlarmStore } from "../stores/useAlarmStore";
import { updateActualTime } from "./UpdateActualTime";

type CreateAlarmRequestBody = {
  routeId: number;
  title: string;
  checklist: string;
  arrivalTime: string;
  startTime: string;
  startName: string;
  endName: string;
  prepareTime: number;
  interval: number;
};

function toLocalDateTimeString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function toStartTimeFromEdt(
  arrivalTime: string,
  edt: string,
  prepareTime: number,
) {
  const [datePart] = arrivalTime.split("T");
  if (!datePart) {
    throw new Error("arrivalTime format is invalid.");
  }

  const [hour = "00", minute = "00", second = "00"] = edt.split(":");
  const startDate = new Date(
    `${datePart}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`,
  );

  if (Number.isNaN(startDate.getTime())) {
    throw new Error("edt format is invalid.");
  }

  startDate.setMinutes(startDate.getMinutes() - Math.max(0, prepareTime));
  return toLocalDateTimeString(startDate);
}

export async function createAlarm() {
  const accessToken = localStorage.getItem("accessToken");
  const {
    routeId,
    title,
    checklist,
    arrivalTime,
    edt,
    eta,
    prepareTime,
    interval,
    startPlace,
    endPlace,
  } = useAlarmStore.getState();

  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is missing.");
  }
  if (!accessToken) {
    throw new Error("accessToken is missing.");
  }
  if (!routeId) {
    throw new Error("routeId is missing.");
  }
  if (!arrivalTime) {
    throw new Error("arrivalTime is missing.");
  }
  if (!edt) {
    throw new Error("edt is missing.");
  }
  if (!eta) {
    throw new Error("eta is missing.");
  }

  const body: CreateAlarmRequestBody = {
    routeId,
    title,
    checklist,
    arrivalTime,
    startTime: toStartTimeFromEdt(arrivalTime, edt, prepareTime),
    startName: startPlace,
    endName: endPlace,
    prepareTime,
    interval,
  };

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/alarm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to create alarm.");
  }

  const result = await response.json();
  const alarmId = Number(result?.data?.alarmId);

  await updateActualTime(alarmId);

  return result;
}
