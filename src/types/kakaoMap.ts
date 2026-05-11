export type KakaoLatLng = { __brand: "KakaoLatLng" };
export type KakaoLatLngBounds = { __brand: "KakaoLatLngBounds" };
export type KakaoMapInstance = {
  __brand: "KakaoMapInstance";
  setBounds: (bounds: KakaoLatLngBounds) => void;
};

export type KakaoMapsApi = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new (sw: KakaoLatLng, ne: KakaoLatLng) => KakaoLatLngBounds;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  Polyline: new (options: {
    map: KakaoMapInstance;
    path: KakaoLatLng[];
    strokeColor: string;
    strokeStyle: "solid" | "shortdash" | "shortdot" | "shortdashdot";
    strokeWeight: number;
  }) => { setMap: (map: KakaoMapInstance) => void };
};

export type KakaoApi = {
  maps: KakaoMapsApi;
};
