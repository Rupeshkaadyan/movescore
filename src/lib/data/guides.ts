export type Guide = {
  slug: string;
  title: string;
  category: "Taxes" | "Housing" | "Jobs" | "Method" | "Moving";
  readingMinutes: number;
  excerpt: string;
  updated: string;
  body: string[];
};

/**
 * Editorial content. Written to be useful first — no keyword stuffing, no
 * fabricated statistics. Any number quoted here must exist in `cities.ts`.
 */
export const GUIDES: Guide[] = [
  {
    slug: "how-movescore-calculates-your-score",
    title: "How MoveScore calculates your MoveScore",
    category: "Method",
    readingMinutes: 6,
    excerpt:
      "The score is not a black box. Here is every category, its weight, and the exact inputs that move it.",
    updated: "2026-09-01",
    body: [
      "A MoveScore is a weighted average of eight category scores, each of which is computed from data you can inspect on the result page. Nothing is hidden, and no category is a vibe.",
      "Financial carries the most weight at 30%, because it is the category that decides whether a move is survivable. It compares your modelled take-home pay against modelled monthly costs in each city, then scores the leftover as a share of income.",
      "Housing is 18% and looks at what it costs to live at your household size — rent per bedroom if you rent, or the full carrying cost of a median home if you buy, including property tax and insurance.",
      "Jobs is 14% and combines the city's wage index for your occupation band, unemployment rate, and year-over-year job growth.",
      "Taxes, transportation, healthcare, weather and lifestyle make up the remaining 38%. Each has between two and four named drivers, and each driver is shown with its raw value so you can disagree with the weighting and still trust the input.",
      "If a category is missing data for a city — a common case while we are still on a 30-city demo set — we renormalise the remaining weights rather than guessing a value. The result page tells you when this happens.",
    ],
  },
  {
    slug: "no-income-tax-states-are-not-free",
    title: "No-income-tax states are not free",
    category: "Taxes",
    readingMinutes: 5,
    excerpt:
      "Texas, Florida, Washington and Tennessee all skip the income tax. They collect the money a different way, and it matters more than you think.",
    updated: "2026-09-01",
    body: [
      "The headline is true: Austin, Miami, Seattle and Nashville all take zero state income tax. On a $100,000 salary that is thousands of dollars a year you keep.",
      "The money does not disappear. Texas and Florida fund local government largely through property tax, and the demo series in this build shows effective property tax rates near 2% in Texas against 0.7% in coastal California. On a $500,000 home, that difference is roughly $6,500 a year — enough to erase a meaningful part of the income tax saving if you buy.",
      "Sales tax is the other lever. Nashville's combined rate in this dataset is 9.25% and Seattle's is 10.35%, against 6.25% in Boston. That shows up in every grocery run and every car repair, and it is regressive: it hits hardest when you spend most of what you earn.",
      "The practical rule: if you rent and spend modestly, no-income-tax states win clearly. If you buy an expensive home, run the property tax line before you celebrate.",
    ],
  },
  {
    slug: "what-salary-you-need-to-move",
    title: "What salary you actually need to move",
    category: "Housing",
    readingMinutes: 7,
    excerpt:
      "The 30% rent rule is a starting point, not an answer. Here is how to work out the real number for a specific city.",
    updated: "2026-09-01",
    body: [
      "Start with rent, not salary. Take the median one-bedroom rent for the city, scale it to the number of bedrooms your household actually needs, and multiply by three to get the gross salary at which housing takes roughly a third of pre-tax income.",
      "Then add the fixed costs that do not scale with rent: a car payment and insurance if the city requires one, healthcare premiums, and any childcare. In car-dependent cities such as Houston, Phoenix or Jacksonville, the transport line is not discretionary.",
      "Finally, test it. Set the salary in the MoveScore comparison to your real offer, and read the 'estimated monthly leftover' rather than the score. A city that leaves you $400 a month is a different decision from one that leaves you $2,000, even at the same MoveScore.",
      "One more check: run the five-year projection. Rent growth compounds. A city 10% cheaper today with 3.5% annual rent growth overtakes a city 15% more expensive with 0.8% growth in under four years.",
    ],
  },
  {
    slug: "rent-or-buy-after-a-move",
    title: "Should you rent or buy right after a move?",
    category: "Housing",
    readingMinutes: 5,
    excerpt:
      "Buying immediately locks in a price in a city you do not know yet. Renting has a cost too. Here is the trade-off.",
    updated: "2026-09-01",
    body: [
      "The strongest argument for renting first is information. Neighbourhood quality inside a city varies far more than city-level averages suggest — the spread between our demo neighbourhood rents in Austin alone runs from about $1,320 to $2,100 for a one-bedroom.",
      "The argument for buying is that you stop paying rent growth. In cities where our demo series shows rent growth above 3% a year, every year of renting costs you compounding ground.",
      "A useful middle path is to rent for twelve months in the neighbourhood you would buy in, then decide with real commute and school data rather than a map.",
      "Whichever you choose, model it. The MoveScore housing mode toggle switches between the rental and ownership calculation, including property tax, so you can see the actual monthly difference instead of arguing about it.",
    ],
  },
  {
    slug: "remote-work-and-state-taxes",
    title: "Remote work does not always mean lower taxes",
    category: "Taxes",
    readingMinutes: 6,
    excerpt:
      "If your employer is in a high-tax state, moving may not change your withholding at all. Check this before you budget.",
    updated: "2026-09-01",
    body: [
      "Several states tax based on where the employer is located, or apply a 'convenience of the employer' rule, rather than where you physically sit. New York is the best-known example.",
      "That means a move from New York to Austin may change your rent, your commute and your weather, but not your state income tax — at least not automatically, and not without a documented change in your work arrangement.",
      "The safe sequence is: confirm with payroll which state they will withhold, then run the MoveScore comparison using the destination's tax profile only if withholding actually changes.",
      "If it does not change, the honest comparison is one where only housing, transportation and day-to-day costs move. That is still usually a large number, but it is smaller than the full-model figure, and you should know which one you are looking at.",
    ],
  },
  {
    slug: "cost-of-moving-nobody-budgets",
    title: "The moving costs nobody budgets for",
    category: "Moving",
    readingMinutes: 4,
    excerpt:
      "The truck quote is the visible half. Deposits, overlap rent, utility setup and car registration are the other half.",
    updated: "2026-09-01",
    body: [
      "Long-distance movers price on weight and distance, which is why the MoveScore moving-cost estimate scales with household size and miles rather than quoting a flat fee.",
      "The invisible half is the overlap: first month's rent plus a security deposit at the destination, often while you are still paying rent at the origin. Budget two weeks of double housing at minimum.",
      "Then there are the administrative costs — utility deposits, a new driver's licence and registration, and in some states a vehicle inspection or emissions test. These are small individually and add up to several hundred dollars.",
      "Finally, count the break-even. The moving-cost panel shows how many months of modelled monthly savings it takes to pay the move back. If that number is longer than you expect to stay, the move is a lifestyle decision, not a financial one — which is a perfectly good reason to move, as long as you know it.",
    ],
  },
];

export const GUIDE_BY_SLUG: Record<string, Guide> = Object.fromEntries(
  GUIDES.map((g) => [g.slug, g]),
);
