import type { City, HouseholdInput, MoveCostEstimate } from "@/lib/types";
import { bedroomsFor } from "@/lib/calc/costOfLiving";

/** Great-circle distance in miles. */
export function distanceMiles(a: City, b: City): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/**
 * Moving-cost estimate: professional movers priced on weight and distance,
 * plus the upfront housing and administrative costs people forget.
 */
export function estimateMoveCost(
  origin: City,
  destination: City,
  input: HouseholdInput,
  destinationHousingMonthly: number,
): MoveCostEstimate {
  const bedrooms = bedroomsFor(input.householdSize);
  const weightFactor = [1, 1, 1.5, 2.2, 2.8][Math.min(bedrooms, 4)] ?? 1;
  const distance = distanceMiles(origin, destination);

  const movers = (800 + 0.9 * distance) * weightFactor;
  const packing = 150 * weightFactor;
  const travel = 250 + 0.35 * distance;
  const upfrontHousing = destinationHousingMonthly * 1.5;
  const utilitiesSetup = 400;
  const vehicleAdmin = input.ownsCar ? 180 : 0;

  const lineItems = [
    {
      label: "Professional movers",
      amount: movers,
      note: `${weightFactor.toFixed(1)}× weight factor, ${distance.toLocaleString()} miles`,
    },
    { label: "Packing materials", amount: packing, note: "Boxes, tape, wraps" },
    {
      label: "Travel, fuel and lodging",
      amount: travel,
      note: "Drive or flights for the household",
    },
    {
      label: "First month + deposit",
      amount: upfrontHousing,
      note: "1.5× destination monthly housing",
    },
    { label: "Utility setup and deposits", amount: utilitiesSetup, note: "Power, water, internet" },
    ...(vehicleAdmin
      ? [
          {
            label: "Vehicle registration and licence",
            amount: vehicleAdmin,
            note: destination.stateCode,
          },
        ]
      : []),
  ];

  const mid = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    distanceMiles: distance,
    low: Math.round(mid * 0.8),
    mid: Math.round(mid),
    high: Math.round(mid * 1.25),
    lineItems,
    monthsToBreakEven: null,
    methodology:
      "Long-distance movers are priced on weight and distance. The weight factor follows bedroom count; the range is -20% to +25% around the mid estimate for DIY vs full-service.",
  };
}

export function withBreakEven(
  estimate: MoveCostEstimate,
  monthlySavings: number,
): MoveCostEstimate {
  return {
    ...estimate,
    monthsToBreakEven:
      monthlySavings > 0 ? Math.ceil(estimate.mid / monthlySavings) : null,
  };
}
