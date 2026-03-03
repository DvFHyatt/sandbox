# Executive Concierge App

A Park Hyatt-inspired concierge experience for Hyatt's South African properties:

- Park Hyatt Johannesburg
- Hyatt Regency Cape Town
- Hyatt House Sandton
- Hyatt House Rosebank

## Features

- Property selector for all four hotels.
- Curated recommendations across:
  - Restaurant bookings
  - Wine tastings
  - Theatre performances
  - Dance performances
  - Comedy performances
  - Art gallery exhibitions
  - Special events
  - Concerts
  - Other
- Automatic filtering to options within **5km** of the selected property.
- Venue cards use photography sourced from venues' own websites (plus platform imagery where relevant) with bundled local image assets for stable preview rendering, with entity-tied placeholders when external images are unavailable.
- Ranking is based on Google rating and review volume confidence.
- Tripadvisor ratings are shown below Google ratings when available.
- Each card includes a direct live booking/reservations link plus Google Maps.
- Concerts and culture categories are populated with ticketing-platform inventory links from Quicket, Webtickets, Ticketmaster, and Howler.
- "Open now" filtering based on current South Africa time (SAST), so only currently open establishments are shown.
- Elegant Park Hyatt-style visual language.

## Run locally

Open `index.html` in a browser.

Tip: you can force a property in preview via URL params (for example `?property=hyatt-regency-cape-town`).
