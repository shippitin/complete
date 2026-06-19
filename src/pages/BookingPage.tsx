// src/pages/BookingPage.tsx
import React, { useState } from "react";

const BookingPage: React.FC = () => {
  const [isInternational, setIsInternational] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [pickupOption, setPickupOption] = useState("door");
  const [deliveryOption, setDeliveryOption] = useState("door");
  const [containers, setContainers] = useState<Record<string, number>>({});
  const [weight, setWeight] = useState("");
  const [commodity, setCommodity] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [serviceRequired, setServiceRequired] = useState("");

  const containerOptions = [
    "20 ft Standard",
    "20 ft High Cube",
    "22 ft High Cube",
    "40 ft Standard",
    "40 ft High Cube",
    "45 ft High Cube",
    "20 ft High Cube Reefer",
    "40 ft High Cube Reefer",
  ];

  const serviceOptions = [
    "Factory Stuffing - Factory Destuffing",
    "Factory Stuffing - Terminal Destuffing",
    "Terminal Stuffing - Factory Destuffing",
    "Terminal Stuffing - Terminal Destuffing",
  ];

  const handleContainerChange = (type: string, change: number) => {
    setContainers((prev) => {
      const updated = { ...prev, [type]: Math.max(0, (prev[type] || 0) + change) };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      isInternational,
      startLocation,
      destinationLocation,
      pickupOption,
      deliveryOption,
      containers,
      weight,
      commodity,
      departureDate,
      serviceRequired,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">New Booking</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Domestic / International</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="shipmentType"
                value="domestic"
                checked={!isInternational}
                onChange={() => setIsInternational(false)}
              />{" "}
              Domestic
            </label>
            <label>
              <input
                type="radio"
                name="shipmentType"
                value="international"
                checked={isInternational}
                onChange={() => setIsInternational(true)}
              />{" "}
              International
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Start Location</label>
          <input
            type="text"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Destination Location</label>
          <input
            type="text"
            value={destinationLocation}
            onChange={(e) => setDestinationLocation(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Pickup Option</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="pickup"
                value="door"
                checked={pickupOption === "door"}
                onChange={() => setPickupOption("door")}
              />{" "}
              Received at your Door
            </label>
            <label>
              <input
                type="radio"
                name="pickup"
                value="terminal"
                checked={pickupOption === "terminal"}
                onChange={() => setPickupOption("terminal")}
              />{" "}
              Received at Terminal/Ramp
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Delivery Option</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="delivery"
                value="door"
                checked={deliveryOption === "door"}
                onChange={() => setDeliveryOption("door")}
              />{" "}
              Delivered at your Door
            </label>
            <label>
              <input
                type="radio"
                name="delivery"
                value="terminal"
                checked={deliveryOption === "terminal"}
                onChange={() => setDeliveryOption("terminal")}
              />{" "}
              Delivered at Terminal/Ramp
            </label>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block font-medium mb-2">Select your container</label>
          <div className="grid grid-cols-2 gap-4">
            {containerOptions.map((type) => (
              <div key={type} className="flex items-center justify-between border p-2 rounded">
                <span>{type}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleContainerChange(type, -1)}>-</button>
                  <span>{containers[type] || 0}</span>
                  <button type="button" onClick={() => handleContainerChange(type, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Cargo Weight</label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Commodity</label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">First Available Departure</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Service Required</label>
          <select
            value={serviceRequired}
            onChange={(e) => setServiceRequired(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select service</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 text-right">
          <button type="submit" className="bg-brand-gradient text-white px-6 py-2 rounded">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;