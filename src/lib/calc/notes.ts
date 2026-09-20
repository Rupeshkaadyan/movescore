/**
 * Static assumption copy, split out of the calculation modules so client
 * components can display it without pulling the whole engine into the bundle.
 */
export const COL_ASSUMPTIONS = [
  "National baselines: utilities $180, groceries $400, healthcare $480, misc $520 per adult per month.",
  "Children are costed at roughly 60% of an adult for groceries, healthcare and misc.",
  "Housing uses the city's own median rent or median home price, not an index.",
  "Homeownership assumes 20% down, a 30-year fixed loan at 6.8%, plus property tax, insurance and 1% annual maintenance.",
  "Car ownership is costed at $560 per vehicle per month (payment, insurance, fuel, maintenance, parking).",
  "No car: the city's monthly transit fare per adult plus a $60 buffer for ride-hail and occasional rentals.",
];

export const TAX_ASSUMPTIONS_LABEL = [
  "2025 federal brackets and standard deduction; no itemised deductions or credits.",
  "State and local income tax use the effective rate published per city, not a marginal bracket calculation.",
  "FICA: 6.2% Social Security up to the wage base, 1.45% Medicare, plus 0.9% above the threshold.",
  "No pre-tax retirement deferrals, HSA contributions or self-employment tax are modelled.",
];

export const PROJECTION_ASSUMPTIONS = [
  "3% annual salary growth, applied to take-home pay.",
  "2.5% annual inflation on non-housing costs.",
  "Each city's own rent or home-price growth rate, applied to housing.",
  "No investment returns, windfalls or one-off costs are included.",
];

export const MOVE_COST_ASSUMPTIONS = [
  "Professional movers priced on weight (by bedroom count) and distance.",
  "Range shown is -20% (DIY truck) to +25% (full-service packing).",
  "Includes first month plus deposit at the destination, utility setup, and vehicle registration where relevant.",
];
