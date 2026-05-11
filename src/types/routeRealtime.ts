export type AvailableTrain = {
  wayName?: string;
  departureTime?: string;
};
export type ArrivingBus = {
  arrivalMessage?: string;
  arrivalTimeSeconds?: number;
};
export type SegmentBoardingInfo = {
  trafficType?: number;
  transportId?: string;
  availableTrains?: AvailableTrain[];
  arrivingBuses?: ArrivingBus[];
};
export type DetailRoutePayload = {
  segmentBoardingInfos?: SegmentBoardingInfo[];
};
export type DetailRouteResponse = {
  data?: DetailRoutePayload[];
};
