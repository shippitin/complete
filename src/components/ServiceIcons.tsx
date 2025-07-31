import {
  FaTrain,
  FaShip,
  FaPlane,
  FaTruck,
  FaBoxes,
  FaBox,
  FaFileInvoice,
  FaShieldAlt,
  FaExchangeAlt,
  FaHome,
} from "react-icons/fa";
import type { ServiceTypes } from "../types/ServiceTypes";

interface ServiceIconsProps {
  activeService: ServiceTypes;
  onServiceChange: (service: ServiceTypes) => void;
}

const iconMap: Record<ServiceTypes, { icon: JSX.Element; label: string }> = {
  doortodoor: { icon: <FaHome size={24} />, label: "Door to Door" },
  rail: { icon: <FaTrain size={24} />, label: "Rail" },
  sea: { icon: <FaShip size={24} />, label: "Sea" },
  air: { icon: <FaPlane size={24} />, label: "Air" },
  truck: { icon: <FaTruck size={24} />, label: "Truck" },
  lcl: { icon: <FaBoxes size={24} />, label: "LCL" },
  parcel: { icon: <FaBox size={24} />, label: "Parcel" },
  customs: { icon: <FaFileInvoice size={24} />, label: "Customs" },
  insurance: { icon: <FaShieldAlt size={24} />, label: "Insurance" },
  firstlastmile: { icon: <FaExchangeAlt size={24} />, label: "First/Last" },
};

export default function ServiceIcons({
  activeService,
  onServiceChange,
}: ServiceIconsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
      {Object.entries(iconMap).map(([service, { icon, label }]) => {
        const isActive = activeService === service;
        return (
          <button
            key={service}
            onClick={() => onServiceChange(service as ServiceTypes)}
            className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-200
              ${
                isActive
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
          >
            {icon}
            <span className="text-xs mt-1">{label}</span>
          </button>
        );
      })}
    </div>
  );
}