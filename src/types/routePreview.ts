// 미리보기 관련 데이터 타입 정의
export type PreviewPoint = { x: number; y: number };
export type PreviewBounds = {
  sw: PreviewPoint;
  ne: PreviewPoint;
};
export type PreviewSegment = {
  points: PreviewPoint[];
  color: string;
  strokeStyle?: "solid" | "shortdash" | "shortdot" | "shortdashdot";
};
export type PreviewResponse = {
  bounds: PreviewBounds;
  segments: PreviewSegment[];
};
