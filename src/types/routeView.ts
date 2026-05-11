export type RouteSegment = {
  trafficType?: number;
  sectionTime?: number;
  distance?: number;
  busNo?: string;
  busType?: number;
  stationCount?: number;
  startStop?: string;
  endStop?: string;
  lineName?: string;
  subwayCode?: number;
  startStation?: string;
  endStation?: string;
};
export type DisplayRouteSegment = RouteSegment & {
  sourceIndices: number[];
};

export type TransitBarSection = {
  top: number;
  height: number;
  colorClass: string;
  backgroundColor?: string;
  trafficType: 1 | 2;
};
