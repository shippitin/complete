// src/constants/initialFormData.ts
import type { QuoteFormData } from "../types/QuoteFormData";

export const initialFormData: QuoteFormData = {
  shipmentMode: "Road",
  origin: {
    country: "",
    city: "",
    zip: ""
  },
  destination: {
    country: "",
    city: "",
    zip: ""
  },
  load: {
    mode: "Loose Cargo",
    units: ""
  },
  goods: {
    goodsType: "",
    goodsValue: "",
    isHazardous: false,
    isReadyToShip: false
  },
  serviceType: ""
};