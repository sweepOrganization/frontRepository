export type Segment = {
  sectionTime?: number;
  trafficType?: number;
  lineName?: string;
  subwayCode?: number;
  busNo?: string;
  busType?: number;
  startStop?: string;
  endStop?: string;
};

export type TrafficResponse = {
  routeId?: number | null;
  totalTime?: number;
  segments?: Segment[];
};

export type BoardingInfo = {
  recommendedDepartureTime?: string;
};
