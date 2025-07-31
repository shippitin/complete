import { type ReactNode } from "react";

export type ShipmentMode = "Road" | "Rail" | "Sea" | "Air" | "Parcel";

export interface QuoteFormData {
  weight: string | number | readonly string[] | undefined;
  goodsDescription: string | number | readonly string[] | undefined;
  shipmentMode: ReactNode;
  mode: ShipmentMode;
  origin: {
    zip: string | number | readonly string[] | undefined;
    cityOrZip: ReactNode;
    country: string;
    city: string;
    zipCode: string;
  };
  destination: {
    cityOrZip: ReactNode;
    country: string;
    city: string;
    zipCode: string;
  };
  load: {
    type: string;
    units: string;
  };
  goods: {
    currency: ReactNode;
    type: string;
    value: string;
    isHazardous: boolean;
    isReadyToShip: boolean;
  };
}