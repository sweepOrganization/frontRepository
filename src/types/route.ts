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
  routePreviewId?: string | null;
  totalTime?: number;
  payment?: number;
  segments?: Segment[];
};

export type BoardingInfo = {
  recommendedDepartureTime?: string;
  segmentBoardingInfos?: SegmentBoardingInfo[];
};

export type SegmentBoardingInfo = {
  trafficType?: number;
  stopOrStation?: string;
  transportId?: string;
};
