import { describe, expect, it } from "vitest";
import {
  buildQueryString,
  compareHref,
  parseCompareOptions,
  parseHouseholdInput,
} from "@/lib/query";
import { parseComparisonSlug, comparisonSlug, citySlug, search } from "@/lib/cities";
import { DEFAULT_INPUT, DEFAULT_OPTIONS } from "@/lib/defaults";
import { CITY_BY_SLUG } from "@/lib/data/cities";

describe("shareable comparison URLs", () => {
  it("falls back to defaults for an empty query", () => {
    expect(parseHouseholdInput({})).toEqual(DEFAULT_INPUT);
  });

  it("parses every scenario field", () => {
    const input = parseHouseholdInput({
      salary: "150000",
      household: "3",
      children: "1",
      car: "no",
      housing: "own",
      filing: "married",
    });
    expect(input).toMatchObject({
      salary: 150_000,
      householdSize: 3,
      children: 1,
      ownsCar: false,
      housingMode: "own",
      filingStatus: "married",
    });
  });

  it("never allows more children than the household allows", () => {
    const input = parseHouseholdInput({ household: "2", children: "5" });
    expect(input.children).toBeLessThanOrEqual(input.householdSize - 1);
  });

  it("clamps absurd salaries instead of trusting them", () => {
    expect(parseHouseholdInput({ salary: "999999999" }).salary).toBe(5_000_000);
    expect(parseHouseholdInput({ salary: "1" }).salary).toBe(10_000);
  });

  it("round-trips through the query string", () => {
    const input = parseHouseholdInput({
      salary: "123000",
      household: "4",
      children: "2",
      car: "no",
      housing: "own",
      filing: "married",
    });
    const params = new URLSearchParams(buildQueryString(input, DEFAULT_OPTIONS));
    const raw = Object.fromEntries(params.entries());
    expect(parseHouseholdInput(raw)).toEqual(input);
    expect(parseCompareOptions(raw)).toEqual(DEFAULT_OPTIONS);
  });

  it("builds a comparison href with the scenario attached", () => {
    const href = compareHref("new-york-ny", "austin-tx", DEFAULT_INPUT, DEFAULT_OPTIONS);
    expect(href.startsWith("/compare/new-york-ny-vs-austin-tx?")).toBe(true);
    expect(href).toContain("salary=100000");
  });
});

describe("slug handling", () => {
  it("parses a valid comparison slug", () => {
    expect(parseComparisonSlug("new-york-ny-vs-austin-tx")).toEqual({
      from: "new-york-ny",
      to: "austin-tx",
    });
  });

  it("rejects slugs for cities that do not exist", () => {
    expect(parseComparisonSlug("atlantis-xx-vs-austin-tx")).toBeNull();
    expect(parseComparisonSlug("austin-tx")).toBeNull();
  });

  it("round-trips a comparison slug", () => {
    const slug = comparisonSlug("new-york-ny", "austin-tx");
    expect(parseComparisonSlug(slug)?.from).toBe("new-york-ny");
  });

  it("slugifies city names into the documented format", () => {
    expect(citySlug("Salt Lake City", "UT")).toBe("salt-lake-city-ut");
  });

  it("only creates comparison slugs for real cities", () => {
    expect(CITY_BY_SLUG[comparisonSlug("new-york-ny", "austin-tx")]).toBeUndefined();
  });
});

describe("search", () => {
  it("finds a city by name", () => {
    const hits = search("Austin");
    expect(hits[0].type).toBe("city");
    expect(hits[0].href).toBe("/cities/austin-tx");
  });

  it("understands an X vs Y query", () => {
    const hits = search("New York vs Austin");
    expect(hits[0].type).toBe("comparison");
    expect(hits[0].href).toBe("/compare/new-york-ny-vs-austin-tx");
  });

  it("returns nothing for an empty query", () => {
    expect(search("   ")).toEqual([]);
  });
});
