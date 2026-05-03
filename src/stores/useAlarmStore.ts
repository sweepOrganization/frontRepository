import { create } from "zustand";
import {
  combine,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

export type Alarm = {
  title: string;
  arrivalTime: string;
  edt: string;
  eta: string;
  startTime: string;
  prepareTime: number;
  interval: number;
  routeId: number | null;
  checklist: string;
  startPlace: string;
  endPlace: string;
  startLat: number | null;
  startLon: number | null;
  endLat: number | null;
  endLon: number | null;
};

const initialAlarm: Alarm = {
  title: "",
  arrivalTime: "",
  edt: "",
  eta: "",
  startTime: "",
  prepareTime: 0,
  interval: 0,
  routeId: null,
  checklist: "",
  startPlace: "",
  endPlace: "",
  startLat: null,
  startLon: null,
  endLat: null,
  endLon: null,
};

export const useAlarmStore = create(
  devtools(
    persist(
      combine({ ...initialAlarm }, (set) => ({
        actions: {
          setTitle: (title: string) => set({ title }),
          setArrivalTime: (arrivalTime: string) => set({ arrivalTime }),
          setEdt: (edt: string) => set({ edt }),
          setEta: (eta: string) => set({ eta }),
          setStartTime: (startTime: string) => set({ startTime }),
          setPrepareTime: (prepareTime: number) => set({ prepareTime }),
          setInterval: (interval: number) => set({ interval }),
          setRouteId: (routeId: number | null) => set({ routeId }),
          setChecklist: (checklist: string) => set({ checklist }),
          setStartPlace: (startPlace: string) => set({ startPlace }),
          setEndPlace: (endPlace: string) => set({ endPlace }),
          setStartLat: (startLat: number | null) => set({ startLat }),
          setStartLon: (startLon: number | null) => set({ startLon }),
          setEndLat: (endLat: number | null) => set({ endLat }),
          setEndLon: (endLon: number | null) => set({ endLon }),
          reset: () => set({ ...initialAlarm }),
        },
      })),
      {
        name: "alarmStore",
        partialize: (state) => ({
          title: state.title,
          arrivalTime: state.arrivalTime,
          edt: state.edt,
          eta: state.eta,
          startTime: state.startTime,
          prepareTime: state.prepareTime,
          interval: state.interval,
          routeId: state.routeId,
          checklist: state.checklist,
          startPlace: state.startPlace,
          endPlace: state.endPlace,
          startLat: state.startLat,
          startLon: state.startLon,
          endLat: state.endLat,
          endLon: state.endLon,
        }),
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    {
      name: "alarmStore",
    },
  ),
);

//꺼내오기
export const useAlarmTitle = () => useAlarmStore((state) => state.title);
export const useAlarmArrivalTime = () =>
  useAlarmStore((state) => state.arrivalTime);
export const useAlarmEdt = () => useAlarmStore((state) => state.edt);
export const useAlarmEta = () => useAlarmStore((state) => state.eta);
export const useAlarmStartTime = () =>
  useAlarmStore((state) => state.startTime);
export const useAlarmPrepareTime = () =>
  useAlarmStore((state) => state.prepareTime);
export const useAlarmInterval = () => useAlarmStore((state) => state.interval);
export const useAlarmRouteId = () => useAlarmStore((state) => state.routeId);
export const useAlarmChecklist = () =>
  useAlarmStore((state) => state.checklist);
export const useAlarmStartPlace = () =>
  useAlarmStore((state) => state.startPlace);
export const useAlarmEndPlace = () => useAlarmStore((state) => state.endPlace);
export const useAlarmStartLat = () => useAlarmStore((state) => state.startLat);
export const useAlarmStartLon = () => useAlarmStore((state) => state.startLon);
export const useAlarmEndLat = () => useAlarmStore((state) => state.endLat);
export const useAlarmEndLon = () => useAlarmStore((state) => state.endLon);

//설정하기
export const useSetAlarmTitle = () =>
  useAlarmStore((state) => state.actions.setTitle);
export const useSetAlarmArrivalTime = () =>
  useAlarmStore((state) => state.actions.setArrivalTime);
export const useSetAlarmEdt = () => useAlarmStore((state) => state.actions.setEdt);
export const useSetAlarmEta = () => useAlarmStore((state) => state.actions.setEta);
export const useSetAlarmStartTime = () =>
  useAlarmStore((state) => state.actions.setStartTime);
export const useSetAlarmPrepareTime = () =>
  useAlarmStore((state) => state.actions.setPrepareTime);
export const useSetAlarmInterval = () =>
  useAlarmStore((state) => state.actions.setInterval);
export const useSetAlarmRouteId = () =>
  useAlarmStore((state) => state.actions.setRouteId);
export const useSetAlarmChecklist = () =>
  useAlarmStore((state) => state.actions.setChecklist);
export const useSetAlarmStartPlace = () =>
  useAlarmStore((state) => state.actions.setStartPlace);
export const useSetAlarmEndPlace = () =>
  useAlarmStore((state) => state.actions.setEndPlace);
export const useSetAlarmStartLat = () =>
  useAlarmStore((state) => state.actions.setStartLat);
export const useSetAlarmStartLon = () =>
  useAlarmStore((state) => state.actions.setStartLon);
export const useSetAlarmEndX = () =>
  useAlarmStore((state) => state.actions.setEndLat);
export const useSetAlarmEndLon = () =>
  useAlarmStore((state) => state.actions.setEndLon);
export const useResetAlarm = () =>
  useAlarmStore((state) => state.actions.reset);
