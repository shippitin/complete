import React from "react";

interface TimelineProps {
  status?: any; // Replace any with your actual status type
}

const Timeline: React.FC<TimelineProps> = ({ status }) => {
  return (
    <div>
      {/* Your timeline logic */}
      {status && <pre>{JSON.stringify(status, null, 2)}</pre>}
    </div>
  );
};

export default Timeline;