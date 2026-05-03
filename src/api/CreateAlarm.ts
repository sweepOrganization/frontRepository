import { useAlarmStore } from "../stores/useAlarmStore";

type CreateAlarmRequestBody = {
  routeId: number;
  title: string;
  checklist: string;
  arrivalTime: string;
  startTime: string;
  prepareTime: number;
  interval: number;
};

function toStartTimeFromEdt(
  arrivalTime: string,
  edt: string,
  prepareTime: number,
) {
  const [datePart] = arrivalTime.split("T");
  if (!datePart) {
    throw new Error("arrivalTime 형식이 올바르지 않습니다.");
  }

  const [hour = "00", minute = "00", second = "00"] = edt.split(":");
  const startDate = new Date(
    `${datePart}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`,
  );

  if (Number.isNaN(startDate.getTime())) {
    throw new Error("EDT 형식이 올바르지 않습니다.");
  }

  startDate.setMinutes(startDate.getMinutes() - Math.max(0, prepareTime));
  return startDate.toISOString();
}

export async function createAlarm() {
  const accessToken = localStorage.getItem("accessToken");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { routeId, title, checklist, arrivalTime, edt, prepareTime, interval } =
    useAlarmStore.getState();

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL이 설정되지 않았습니다.");
  }
  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }
  if (!routeId) {
    throw new Error("routeId가 없습니다.");
  }
  if (!arrivalTime) {
    throw new Error("arrivalTime이 없습니다.");
  }
  if (!edt) {
    throw new Error("edt가 없습니다.");
  }
  const normalizedArrivalTime = new Date(arrivalTime).toISOString();

  const body: CreateAlarmRequestBody = {
    routeId,
    title,
    checklist,
    arrivalTime: normalizedArrivalTime,
    startTime: toStartTimeFromEdt(normalizedArrivalTime, edt, prepareTime),
    prepareTime,
    interval,
  };

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/alarm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("알림 생성 요청에 실패했습니다.");
  }

  return response.json();
}
