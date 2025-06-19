import React from "react";

interface MapProps {
  route?: any; // Replace any with your route type if known
}

const Map: React.FC<MapProps> = ({ route }) => {
  return (
    <div>
      {/* Your map logic */}
      {route && <pre>{JSON.stringify(route, null, 2)}</pre>}
    </div>
  );
};

export default Map;