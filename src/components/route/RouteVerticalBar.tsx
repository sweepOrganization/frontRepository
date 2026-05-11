import type { TransitBarSection } from "../../types/routeView";

type RouteVerticalBarProps = {
  routeBarHeight: number;
  transitBarSections: TransitBarSection[];
};

export default function RouteVerticalBar({
  routeBarHeight,
  transitBarSections,
}: RouteVerticalBarProps) {
  return (
    <div className="relative w-5" style={{ height: `${routeBarHeight}px` }}>
      <div className="absolute inset-y-0 left-1/2 w-[16px] -translate-x-1/2 rounded-[4px] bg-[#E5E7EB]" />
      {transitBarSections.map((section, index) => (
        <div key={`bus-bar-${index}`}>
          <div
            className={`absolute left-1/2 w-[16px] -translate-x-1/2 rounded-[4px] ${section.colorClass}`}
            style={{
              top: `${section.top}px`,
              height: `${section.height + 5}px`,
              backgroundColor: section.backgroundColor,
            }}
          />
          <div
            className={`absolute left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-[6px] ${section.colorClass}`}
            style={{
              top: `${section.top - 15}px`,
              backgroundColor: section.backgroundColor,
            }}
          >
            {section.trafficType === 2 ? (
              <img src="/BusIcon.svg" alt="bus" className="h-4 w-4 shrink-0" />
            ) : (
              <img
                src="/SubwayIcon.svg"
                alt="subway"
                className="h-4 w-4 shrink-0"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
