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
  startTime: string;
  prepareTime: number;
  interval: number;
  routeId: number | null;
  checklist: string;
};

const initialAlarm: Alarm = {
  title: "",
  arrivalTime: "",
  startTime: "",
  prepareTime: 0,
  interval: 0,
  routeId: null,
  checklist: "",
};

export const useAlarmStore = create(
  devtools(
    persist(
      combine({ ...initialAlarm }, (set) => ({
        actions: {
          setTitle: (title: string) => set({ title }),
          setArrivalTime: (arrivalTime: string) => set({ arrivalTime }),
          setStartTime: (startTime: string) => set({ startTime }),
          setPrepareTime: (prepareTime: number) => set({ prepareTime }),
          setInterval: (interval: number) => set({ interval }),
          setRouteId: (routeId: number | null) => set({ routeId }),
          setChecklist: (checklist: string) => set({ checklist }),
          reset: () => set({ ...initialAlarm }),
        },
      })),
      {
        name: "alarmStore",
        partialize: (state) => ({
          title: state.title,
          arrivalTime: state.arrivalTime,
          startTime: state.startTime,
          prepareTime: state.prepareTime,
          interval: state.interval,
          routeId: state.routeId,
          checklist: state.checklist,
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
export const useAlarmStartTime = () =>
  useAlarmStore((state) => state.startTime);
export const useAlarmPrepareTime = () =>
  useAlarmStore((state) => state.prepareTime);
export const useAlarmInterval = () => useAlarmStore((state) => state.interval);
export const useAlarmRouteId = () => useAlarmStore((state) => state.routeId);
export const useAlarmChecklist = () =>
  useAlarmStore((state) => state.checklist);

//설정하기
export const useSetAlarmTitle = () =>
  useAlarmStore((state) => state.actions.setTitle);
export const useSetAlarmArrivalTime = () =>
  useAlarmStore((state) => state.actions.setArrivalTime);
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
export const useResetAlarm = () =>
  useAlarmStore((state) => state.actions.reset);
