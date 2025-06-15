import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";

const AddNewAddress = () => {
  // Add state for all fields
  const [title, setTitle] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const [distance, setDistance] = useState(""); // <-- add distance state

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPincode(value);
    if (value && value !== "852127") {
      setError("we are currently active at 852127 only");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode !== "852127") {
      setError("we are currently active at 852127 only");
      return;
    }
    if (!distance || isNaN(Number(distance))) {
      setError("Distance (in km) is required and must be a number");
      return;
    }
    // ...submit logic...
  };

  return (
    <div>
      <div>
        {/* Heading */}
        <div className="flex items-center px-4 pt-4 pb-2">
          <h2 className="text-xl font-bold">Add New Address</h2>
        </div>
        {/* Info box */}
        <div className="mx-4 mb-4 rounded-lg bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 text-center font-semibold text-base shadow-sm">
          we are currently available at{" "}
          <span className="font-bold">852127</span> only
        </div>
        {/* ...existing code for the Add New Address page... */}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Address Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="fullAddress">Full Address *</label>
            <textarea
              id="fullAddress"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="landmark">Landmark</label>
            <input
              id="landmark"
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="input"
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="city">City *</label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="pincode">Pincode *</label>
              <input
                id="pincode"
                type="text"
                value={pincode}
                onChange={handlePincodeChange}
                required
                className="input"
              />
              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="distance">Distance (in km) *</label>
            <input
              id="distance"
              type="number"
              min="0"
              step="0.01"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Set as default address
            </label>
          </div>
          <button
            type="submit"
            disabled={
              !!error ||
              !title ||
              !fullAddress ||
              !city ||
              !pincode ||
              !distance ||
              isNaN(Number(distance))
            }
            className="btn btn-primary w-full mt-4"
          >
            Save Address
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default AddNewAddress;