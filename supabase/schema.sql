-- =============================================================================
-- MoveScore — Postgres / Supabase schema (Phase 3)
--
-- Design rule: every quantitative table carries source provenance.
--   source_id          -> sources.id
--   source_date        -> date the publisher last refreshed the series
--   last_updated       -> when MoveScore last wrote the row
--   methodology_note   -> how the value was derived
--
-- Run order: extensions -> reference tables -> city tables -> user tables.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- for city / neighbourhood search

-- ---------------------------------------------------------------------------
-- Reference
-- ---------------------------------------------------------------------------

create table if not exists sources (
  id            text primary key,
  label         text not null,
  publisher     text not null,
  url           text not null,
  last_updated  date not null,
  methodology   text not null,
  license       text,
  created_at    timestamptz default now()
);

create table if not exists states (
  code            text primary key,             -- 'TX'
  name            text not null,
  has_income_tax  boolean not null default true,
  effective_income_tax_rate numeric(5, 2),      -- percent
  sales_tax_rate  numeric(5, 2),                -- combined state + avg local
  source_id       text references sources(id),
  last_updated    timestamptz default now()
);

create table if not exists cities (
  slug           text primary key,              -- 'austin-tx'
  name           text not null,
  state_code     text not null references states(code),
  county         text,
  lat            double precision not null,
  lng            double precision not null,
  timezone       text not null,
  population     integer,
  tagline        text,
  summary        text,
  pros           text[],
  cons           text[],
  published      boolean not null default true,
  source_id      text references sources(id),
  source_date    date,
  last_updated   timestamptz default now(),
  methodology_note text
);

create index if not exists cities_state_idx on cities (state_code);
create index if not exists cities_name_trgm on cities using gin (name gin_trgm_ops);

create table if not exists zip_codes (
  code            text primary key,             -- '78701'
  city_slug       text not null references cities(slug) on delete cascade,
  neighborhood_slug text,
  lat             double precision,
  lng             double precision,
  median_rent_1br integer,
  median_home_price integer,
  source_id       text references sources(id),
  source_date     date,
  last_updated    timestamptz default now()
);

create index if not exists zip_city_idx on zip_codes (city_slug);

-- ---------------------------------------------------------------------------
-- Metrics (one row per city per metric group; keeps provenance tight)
-- ---------------------------------------------------------------------------

create table if not exists housing (
  city_slug         text primary key references cities(slug) on delete cascade,
  median_rent_1br   integer not null,
  median_rent_2br   integer,
  median_rent_3br   integer,
  median_home_price integer,
  property_tax_rate numeric(5, 2) not null,     -- annual percent of value
  rent_growth_yoy   numeric(5, 2),
  home_growth_yoy   numeric(5, 2),
  vacancy_rate      numeric(5, 2),
  source_id         text references sources(id),
  source_date       date,
  last_updated      timestamptz default now(),
  methodology_note  text
);

create table if not exists cost_of_living (
  city_slug            text primary key references cities(slug) on delete cascade,
  col_index            numeric(6, 2) not null,  -- 100 = US average
  rent_index           numeric(6, 2),
  utilities_index      numeric(6, 2),
  groceries_index      numeric(6, 2),
  transportation_index numeric(6, 2),
  healthcare_index     numeric(6, 2),
  misc_index           numeric(6, 2),
  source_id            text references sources(id),
  source_date          date,
  last_updated         timestamptz default now(),
  methodology_note     text
);

create table if not exists salary (
  id              uuid primary key default gen_random_uuid(),
  city_slug       text not null references cities(slug) on delete cascade,
  occupation_slug text not null,                 -- 'software-engineer', 'all'
  median_annual   integer not null,
  p25_annual      integer,
  p75_annual      integer,
  wage_index      numeric(6, 2),                 -- 100 = national for same role
  source_id       text references sources(id),
  source_date     date,
  last_updated    timestamptz default now(),
  methodology_note text,
  unique (city_slug, occupation_slug)
);

create table if not exists jobs (
  city_slug          text primary key references cities(slug) on delete cascade,
  unemployment_rate  numeric(4, 2),
  job_growth_yoy     numeric(5, 2),
  top_industries     text[],
  source_id          text references sources(id),
  source_date        date,
  last_updated       timestamptz default now(),
  methodology_note   text
);

create table if not exists taxes (
  city_slug           text primary key references cities(slug) on delete cascade,
  has_state_income_tax boolean not null,
  state_income_tax_rate numeric(5, 2),           -- effective percent
  local_income_tax_rate numeric(5, 2),
  sales_tax_rate      numeric(5, 2),
  note                text,
  source_id           text references sources(id),
  source_date         date,
  last_updated        timestamptz default now(),
  methodology_note    text
);

create table if not exists transportation (
  city_slug        text primary key references cities(slug) on delete cascade,
  commute_minutes  integer,
  transit_score    integer,
  walk_score       integer,
  bike_score       integer,
  transit_fare_monthly integer,
  source_id        text references sources(id),
  source_date      date,
  last_updated     timestamptz default now(),
  methodology_note text
);

create table if not exists weather (
  city_slug        text primary key references cities(slug) on delete cascade,
  climate_score    integer,
  sunny_days       integer,
  avg_high_f       integer,
  avg_low_f        integer,
  annual_rain_inches numeric(5, 1),
  air_quality_index integer,
  source_id        text references sources(id),
  source_date      date,
  last_updated     timestamptz default now(),
  methodology_note text
);

create table if not exists healthcare (
  city_slug        text primary key references cities(slug) on delete cascade,
  quality_index    integer,
  cost_index       numeric(6, 2),
  source_id        text references sources(id),
  source_date      date,
  last_updated     timestamptz default now(),
  methodology_note text
);

create table if not exists schools (
  city_slug         text primary key references cities(slug) on delete cascade,
  school_score      integer,
  grad_rate         numeric(5, 2),
  bachelor_share    numeric(5, 2),
  source_id         text references sources(id),
  source_date       date,
  last_updated      timestamptz default now(),
  methodology_note  text
);

create table if not exists safety (
  city_slug           text primary key references cities(slug) on delete cascade,
  safety_score        integer,
  violent_crime_per_100k integer,
  property_crime_per_100k integer,
  source_id           text references sources(id),
  source_date         date,
  last_updated        timestamptz default now(),
  methodology_note    text
);

create table if not exists neighborhoods (
  slug              text not null,
  city_slug         text not null references cities(slug) on delete cascade,
  name              text not null,
  rent_1br          integer,
  median_home_price integer,
  commute_minutes   integer,
  safety_score      integer,
  school_score      integer,
  walk_score        integer,
  lifestyle_score   integer,
  population        integer,
  vibe              text,
  description       text,
  source_id         text references sources(id),
  source_date       date,
  last_updated      timestamptz default now(),
  methodology_note  text,
  primary key (city_slug, slug)
);

create index if not exists neighborhoods_city_idx on neighborhoods (city_slug);

-- ---------------------------------------------------------------------------
-- Editorial
-- ---------------------------------------------------------------------------

create table if not exists articles (
  slug            text primary key,
  title           text not null,
  category        text not null,
  excerpt         text not null,
  body            text[] not null,
  reading_minutes integer,
  published       boolean not null default false,
  published_at    timestamptz,
  updated_at      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Users and saved work (Phase 5)
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  home_city_slug text references cities(slug),
  created_at   timestamptz default now()
);

create table if not exists saved_comparisons (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  label          text,
  origin_slug    text not null references cities(slug),
  destination_slug text not null references cities(slug),
  salary         integer not null,
  household_size integer not null default 1,
  children       integer not null default 0,
  owns_car       boolean not null default true,
  housing_mode   text not null default 'rent',
  filing_status  text not null default 'single',
  market_adjust  boolean not null default true,
  move_score     integer,
  monthly_delta  integer,
  share_token    text unique default encode(gen_random_bytes(9), 'hex'),
  created_at     timestamptz default now()
);

create index if not exists saved_comparisons_user_idx on saved_comparisons (user_id);

create table if not exists saved_cities (
  user_id    uuid not null references auth.users(id) on delete cascade,
  city_slug  text not null references cities(slug) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, city_slug)
);

create table if not exists reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  comparison_id  uuid references saved_comparisons(id) on delete set null,
  format         text not null default 'pdf',
  storage_path   text,
  created_at     timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table saved_comparisons enable row level security;
alter table saved_cities enable row level security;
alter table reports enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own comparisons" on saved_comparisons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own cities" on saved_cities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own reports" on reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read on reference data, write restricted to the service role.
do $$
declare
  t text;
begin
  foreach t in array array[
    'sources','states','cities','zip_codes','housing','cost_of_living','salary',
    'jobs','taxes','transportation','weather','healthcare','schools','safety',
    'neighborhoods','articles'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "public read" on %I for select using (true)', t
    );
  end loop;
end $$;
