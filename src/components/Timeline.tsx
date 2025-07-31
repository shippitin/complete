import { useEffect, useRef } from "react";

interface TimelineItem {
  date: string;
  status: string;
  location: string;
}

interface TimelineProps {
  statusTimeline: TimelineItem[];
}

const statusIcons: Record<string, string> = {
  "Dispatched": "📦",
  "In Transit": "🚚",
  "Out for Delivery": "🏠",
};

const Timeline: React.FC<TimelineProps> = ({ statusTimeline }) => {
  const currentStepRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentStepRef.current) {
      currentStepRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const currentIndex = statusTimeline.length - 1;

  return (
    <div className="border-l-2 border-blue-500 ml-6 pl-4 space-y-6 mb-6">
      {statusTimeline.map((item, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={index}
            ref={isCurrent ? currentStepRef : null}
            className={`relative pl-4 ${isCurrent ? "font-semibold text-blue-700" : ""}`}
          >
            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-500" />
            <p className="text-sm text-gray-500">{item.date}</p>
            <p className="text-base flex items-center gap-1">
              <span>{statusIcons[item.status] || "📍"}</span>
              {item.status}
            </p>
            <p className="text-sm text-gray-700">{item.location}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;