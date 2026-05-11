import { useEffect, useState } from "react";
import type { MutableRefObject } from "react";
import type { DisplayRouteSegment, TransitBarSection } from "../types/routeView";

type UseRouteBarMetricsParams = {
  routeContentRef: MutableRefObject<HTMLDivElement | null>;
  transitSectionRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
  displayRouteSegments: DisplayRouteSegment[];
  displayStartName?: string;
  displayEndName?: string;
  getBusColorClass: (busType?: number) => string;
  getSubwayColor: (subwayCode?: number) => string;
};

export default function useRouteBarMetrics({
  routeContentRef,
  transitSectionRefs,
  displayRouteSegments,
  displayStartName,
  displayEndName,
  getBusColorClass,
  getSubwayColor,
}: UseRouteBarMetricsParams) {
  const [routeBarHeight, setRouteBarHeight] = useState(0);
  const [transitBarSections, setTransitBarSections] = useState<
    TransitBarSection[]
  >([]);

  useEffect(() => {
    const element = routeContentRef.current;
    if (!element) return;

    const measure = () => {
      setRouteBarHeight(element.offsetHeight);
      const contentRect = element.getBoundingClientRect();
      const sections = displayRouteSegments
        .map((segment, index): TransitBarSection | null => {
          if (segment.trafficType !== 1 && segment.trafficType !== 2) {
            return null;
          }

          const sectionElement = transitSectionRefs.current[index];
          if (!sectionElement) return null;
          const sectionRect = sectionElement.getBoundingClientRect();

          if (segment.trafficType === 2) {
            return {
              top: sectionRect.top - contentRect.top,
              height: sectionRect.height,
              colorClass: getBusColorClass(segment.busType),
              trafficType: 2,
            };
          }

          return {
            top: sectionRect.top - contentRect.top,
            height: sectionRect.height,
            colorClass: "",
            backgroundColor: getSubwayColor(segment.subwayCode),
            trafficType: 1,
          };
        })
        .filter((section): section is TransitBarSection => section !== null);

      setTransitBarSections(sections);
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    displayRouteSegments,
    displayStartName,
    displayEndName,
    getBusColorClass,
    getSubwayColor,
    routeContentRef,
    transitSectionRefs,
  ]);

  return { routeBarHeight, transitBarSections };
}
