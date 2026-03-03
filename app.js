const properties = [
  { id: 'park-hyatt-johannesburg', name: 'Park Hyatt Johannesburg', coords: { lat: -26.145, lng: 28.0354 } },
  { id: 'hyatt-regency-cape-town', name: 'Hyatt Regency Cape Town', coords: { lat: -33.9249, lng: 18.4241 } },
  { id: 'hyatt-house-sandton', name: 'Hyatt House Sandton', coords: { lat: -26.1085, lng: 28.0549 } },
  { id: 'hyatt-house-rosebank', name: 'Hyatt House Rosebank', coords: { lat: -26.1438, lng: 28.0418 } }
];

const categoryLabels = {
  restaurant: 'Restaurant Bookings',
  wine: 'Wine Tastings',
  theatre: 'Theatre Performances',
  dance: 'Dance Performances',
  comedy: 'Comedy Performances',
  gallery: 'Art Gallery Exhibitions',
  events: 'Special Events',
  concerts: 'Concerts',
  other: 'Other'
};

const venues = [
  {
    name: 'Marble', category: 'restaurant', city: 'Johannesburg', coords: { lat: -26.1458, lng: 28.0339 },
    googleRating: 4.6, googleReviewCount: 2700, tripAdvisorRating: 4.5, tripAdvisorReviewCount: 1600, bookingSource: 'Dineplan',
    availability: 'Live reservations available online',
    bookingUrl: 'https://www.marble.restaurant/reservations/',
    photoUrl: 'assets/photos/venue-01.svg',
    hours: defaultHours('12:00', '22:00')
  },
  {
    name: 'FYN Restaurant', category: 'restaurant', city: 'Cape Town', coords: { lat: -33.9212, lng: 18.4218 },
    googleRating: 4.7, googleReviewCount: 1200, tripAdvisorRating: 4.6, tripAdvisorReviewCount: 940, bookingSource: 'Dineplan',
    availability: 'Live reservations available online',
    bookingUrl: 'https://www.fynrestaurant.com/reservations/',
    photoUrl: 'assets/photos/venue-02.svg',
    hours: { mon: [], tue: [['12:00', '14:30'], ['18:00', '22:00']], wed: [['12:00', '14:30'], ['18:00', '22:00']], thu: [['12:00', '14:30'], ['18:00', '22:00']], fri: [['12:00', '14:30'], ['18:00', '22:00']], sat: [['18:00', '22:00']], sun: [] }
  },
  {
    name: 'Culture Wine Bar', category: 'wine', city: 'Johannesburg', coords: { lat: -26.1366, lng: 28.0409 },
    googleRating: 4.4, googleReviewCount: 460, tripAdvisorRating: 4.3, tripAdvisorReviewCount: 210, bookingSource: 'Direct',
    availability: 'Live booking and walk-in queue options',
    bookingUrl: 'https://www.culturewinebar.com/',
    photoUrl: 'assets/photos/venue-03.svg',
    hours: defaultHours('12:00', '23:00')
  },
  {
    name: 'Wine Menu Tasting Room', category: 'wine', city: 'Cape Town', coords: { lat: -33.9074, lng: 18.4103 },
    googleRating: 4.5, googleReviewCount: 720, tripAdvisorRating: 4.4, tripAdvisorReviewCount: 305, bookingSource: 'Wine Menu',
    availability: 'Live tasting sessions available during service hours',
    bookingUrl: 'https://winemenu.co.za/',
    photoUrl: 'assets/photos/venue-04.svg',
    hours: defaultHours('11:00', '21:00')
  },
  {
    name: 'Artscape Opera House', category: 'theatre', city: 'Cape Town', coords: { lat: -33.9195, lng: 18.4275 },
    googleRating: 4.6, googleReviewCount: 3900, tripAdvisorRating: 4.2, tripAdvisorReviewCount: 980, bookingSource: 'Artscape Box Office',
    availability: 'Tickets available on the official box office',
    bookingUrl: 'https://www.artscape.co.za/whats-on/',
    photoUrl: 'assets/photos/venue-05.svg',
    hours: defaultHours('10:00', '22:00')
  },
  {
    name: 'Theatre on the Square', category: 'comedy', city: 'Johannesburg', coords: { lat: -26.1074, lng: 28.0568 },
    googleRating: 4.5, googleReviewCount: 1800, tripAdvisorRating: 4.3, tripAdvisorReviewCount: 430, bookingSource: 'Theatre on the Square',
    availability: 'Live show tickets and seat maps available',
    bookingUrl: 'https://www.theatreonthesquare.co.za/',
    photoUrl: 'assets/photos/venue-06.svg',
    hours: { mon: [], tue: [['15:00', '22:30']], wed: [['15:00', '22:30']], thu: [['15:00', '22:30']], fri: [['15:00', '23:00']], sat: [['13:00', '23:00']], sun: [['13:00', '20:00']] }
  },
  {
    name: 'Cape Town Comedy Club', category: 'comedy', city: 'Cape Town', coords: { lat: -33.9044, lng: 18.4188 },
    googleRating: 4.6, googleReviewCount: 1500, tripAdvisorRating: 4.5, tripAdvisorReviewCount: 520, bookingSource: 'Cape Town Comedy Club',
    availability: 'Live event ticketing available',
    bookingUrl: 'https://capetowncomedy.com/',
    photoUrl: 'assets/photos/venue-07.svg',
    hours: { mon: [], tue: [['18:00', '23:00']], wed: [['18:00', '23:00']], thu: [['18:00', '23:00']], fri: [['18:00', '23:59']], sat: [['18:00', '23:59']], sun: [['17:00', '22:00']] }
  },
  {
    name: 'Cape Town City Ballet', category: 'dance', city: 'Cape Town', coords: { lat: -33.9222, lng: 18.4204 },
    googleRating: 4.5, googleReviewCount: 520, tripAdvisorRating: 4.1, tripAdvisorReviewCount: 150, bookingSource: 'Cape Town City Ballet',
    availability: 'Live performance and ticket listings',
    bookingUrl: 'https://www.capetowncityballet.org.za/',
    photoUrl: 'assets/photos/venue-08.svg',
    hours: { mon: [['09:00', '17:00']], tue: [['09:00', '17:00']], wed: [['09:00', '17:00']], thu: [['09:00', '17:00']], fri: [['09:00', '17:00']], sat: [['10:00', '14:00']], sun: [] }
  },
  {
    name: 'Everard Read Gallery', category: 'gallery', city: 'Johannesburg', coords: { lat: -26.1339, lng: 28.0373 },
    googleRating: 4.6, googleReviewCount: 680, tripAdvisorRating: 4.4, tripAdvisorReviewCount: 190, bookingSource: 'Everard Read',
    availability: 'Live exhibition and contact booking details',
    bookingUrl: 'https://www.everard-read.co.za/',
    photoUrl: 'assets/photos/venue-09.svg',
    hours: { mon: [['09:00', '17:00']], tue: [['09:00', '17:00']], wed: [['09:00', '17:00']], thu: [['09:00', '17:00']], fri: [['09:00', '17:00']], sat: [['09:00', '14:00']], sun: [] }
  },
  {
    name: 'Zeitz MOCAA', category: 'gallery', city: 'Cape Town', coords: { lat: -33.9061, lng: 18.4202 },
    googleRating: 4.4, googleReviewCount: 9600, tripAdvisorRating: 4.5, tripAdvisorReviewCount: 4100, bookingSource: 'Zeitz MOCAA',
    availability: 'Live timed-entry booking flow available',
    bookingUrl: 'https://zeitzmocaa.museum/visit/',
    photoUrl: 'assets/photos/venue-10.svg',
    hours: { mon: [], tue: [['10:00', '18:00']], wed: [['10:00', '18:00']], thu: [['10:00', '18:00']], fri: [['10:00', '18:00']], sat: [['10:00', '18:00']], sun: [['10:00', '18:00']] }
  },
  {
    name: 'Sandton Rooftop Jazz Nights', category: 'events', city: 'Johannesburg', coords: { lat: -26.1062, lng: 28.0555 },
    googleRating: 4.3, googleReviewCount: 310, bookingSource: 'Webtickets',
    availability: 'Live event page with active booking options',
    bookingUrl: 'https://www.webtickets.co.za/',
    photoUrl: 'assets/photos/venue-11.svg',
    hours: { mon: [], tue: [], wed: [], thu: [['18:00', '23:00']], fri: [['18:00', '23:59']], sat: [['18:00', '23:59']], sun: [] }
  },
  {
    name: 'Neighbourgoods Market', category: 'events', city: 'Cape Town', coords: { lat: -33.9275, lng: 18.4568 },
    googleRating: 4.4, googleReviewCount: 4300, bookingSource: 'Neighbourgoods Market',
    availability: 'Live weekend ticketing and updates',
    bookingUrl: 'https://www.neighbourgoodsmarket.co.za/',
    photoUrl: 'assets/photos/venue-12.svg',
    hours: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [['09:00', '15:00']], sun: [] }
  },
  {
    name: 'Kirstenbosch Summer Sunset Concerts', category: 'concerts', city: 'Cape Town', coords: { lat: -33.9882, lng: 18.4326 },
    googleRating: 4.8, googleReviewCount: 2100, bookingSource: 'Webtickets',
    availability: 'Live concert ticket inventory available',
    bookingUrl: 'https://www.webtickets.co.za/v2/EventCategory.aspx?itemid=1511464288',
    photoUrl: 'assets/photos/venue-13.svg',
    hours: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [['16:00', '22:00']], sun: [['16:00', '22:00']] }
  },
  {
    name: 'Joburg Theatre Concert Nights', category: 'concerts', city: 'Johannesburg', coords: { lat: -26.1943, lng: 28.0456 },
    googleRating: 4.5, googleReviewCount: 5200, bookingSource: 'Webtickets',
    availability: 'Live ticketing available for current shows',
    bookingUrl: 'https://www.webtickets.co.za/v2/Event.aspx?itemid=1524580218',
    photoUrl: 'assets/photos/venue-14.svg',
    hours: { mon: [], tue: [['18:00', '22:30']], wed: [['18:00', '22:30']], thu: [['18:00', '22:30']], fri: [['18:00', '23:30']], sat: [['15:00', '23:30']], sun: [['15:00', '21:00']] }
  },
  {
    name: 'Quicket Live Sessions', category: 'other', city: 'Cape Town', coords: { lat: -33.9249, lng: 18.4241 },
    googleRating: 4.3, googleReviewCount: 1400, bookingSource: 'Quicket',
    availability: 'Live event inventory via booking agent',
    bookingUrl: 'https://www.quicket.co.za/events/',
    photoUrl: 'assets/photos/venue-15.svg',
    hours: defaultHours('08:00', '23:59')
  },
  {
    name: 'Howler Curated Events', category: 'other', city: 'Johannesburg', coords: { lat: -26.1291, lng: 28.0482 },
    googleRating: 4.2, googleReviewCount: 900, bookingSource: 'Howler',
    availability: 'Live ticket and RSVP listings available',
    bookingUrl: 'https://www.howler.co.za/events',
    photoUrl: 'assets/photos/venue-16.svg',
    hours: defaultHours('08:00', '23:59')
  },
  {
    name: 'Ticketmaster South Africa – Concerts', category: 'concerts', city: 'Cape Town', coords: { lat: -33.9235, lng: 18.4233 },
    googleRating: 4.4, googleReviewCount: 2200, bookingSource: 'Ticketmaster',
    availability: 'All live concert listings from Ticketmaster South Africa',
    bookingUrl: 'https://www.ticketmaster.co.za/browse/concerts-catid-10001/music-rid-10001',
    photoUrl: 'assets/photos/venue-17.svg',
    hours: defaultHours('00:00', '23:59')
  },
  {
    name: 'Ticketmaster South Africa – Theatre & Culture', category: 'theatre', city: 'Cape Town', coords: { lat: -33.9229, lng: 18.4271 },
    googleRating: 4.3, googleReviewCount: 2200, bookingSource: 'Ticketmaster',
    availability: 'All theatre and culture listings from Ticketmaster',
    bookingUrl: 'https://www.ticketmaster.co.za/browse/arts-theatre-catid-10002',
    photoUrl: 'assets/photos/venue-18.svg',
    hours: defaultHours('00:00', '23:59')
  },
  {
    name: 'Quicket – Arts & Culture Events', category: 'events', city: 'Johannesburg', coords: { lat: -26.1351, lng: 28.0414 },
    googleRating: 4.3, googleReviewCount: 1400, bookingSource: 'Quicket',
    availability: 'All arts and culture listings from Quicket',
    bookingUrl: 'https://www.quicket.co.za/events/?tags=arts-culture',
    photoUrl: 'assets/photos/venue-19.svg',
    hours: defaultHours('00:00', '23:59')
  },
  {
    name: 'Webtickets – Music & Live Shows', category: 'concerts', city: 'Johannesburg', coords: { lat: -26.1091, lng: 28.0554 },
    googleRating: 4.3, googleReviewCount: 2600, bookingSource: 'Webtickets',
    availability: 'All music and live show listings from Webtickets',
    bookingUrl: 'https://www.webtickets.co.za/v2/Search.aspx?query=music',
    photoUrl: 'assets/photos/venue-20.svg',
    hours: defaultHours('00:00', '23:59')
  },
  {
    name: 'Ticketmaster South Africa – Comedy Events', category: 'comedy', city: 'Cape Town', coords: { lat: -33.9248, lng: 18.4237 },
    googleRating: 4.3, googleReviewCount: 2200, bookingSource: 'Ticketmaster',
    availability: 'All comedy listings from Ticketmaster South Africa',
    bookingUrl: 'https://www.ticketmaster.co.za/browse/comedy-catid-10003',
    photoUrl: 'assets/photos/venue-21.svg',
    hours: defaultHours('00:00', '23:59')
  },
  {
    name: 'Webtickets – Theatre Performances', category: 'theatre', city: 'Cape Town', coords: { lat: -33.9208, lng: 18.4269 },
    googleRating: 4.3, googleReviewCount: 2600, bookingSource: 'Webtickets',
    availability: 'All theatre listings from Webtickets',
    bookingUrl: 'https://www.webtickets.co.za/v2/Search.aspx?query=theatre',
    photoUrl: 'assets/photos/venue-22.svg',
    hours: defaultHours('00:00', '23:59')
  }
];

const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DEFAULT_PROPERTY_ID = 'hyatt-regency-cape-town';
const propertySelect = document.querySelector('#property-select');
const propertyName = document.querySelector('#property-name');
const venueCount = document.querySelector('#venue-count');
const results = document.querySelector('#results');
const propertyQuickSwitch = document.querySelector('#property-quick-switch');
const applyPropertyButton = document.querySelector('#apply-property');
const propertyForm = document.querySelector('#property-form');

let currentPropertyId = getInitialPropertyId();

initializePropertyPicker();
setCurrentProperty(currentPropertyId, { updateUrl: false });

function initializePropertyPicker() {
  propertySelect.innerHTML = '';
  propertyQuickSwitch.innerHTML = '';

  for (const property of properties) {
    const option = document.createElement('option');
    option.value = property.id;
    option.textContent = property.name;
    propertySelect.append(option);

    const chipLink = document.createElement('a');
    chipLink.href = buildPropertyUrl(property.id);
    chipLink.className = 'property-chip';
    chipLink.dataset.propertyId = property.id;
    chipLink.textContent = property.name;
    chipLink.setAttribute('aria-pressed', 'false');
    propertyQuickSwitch.append(chipLink);
  }

  propertySelect.addEventListener('change', handlePropertyChange);
  propertySelect.addEventListener('input', handlePropertyChange);
  propertySelect.onchange = handlePropertyChange;

  propertyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setCurrentProperty(propertySelect.value);
    window.location.href = buildPropertyUrl(propertySelect.value);
  });

  window.addEventListener('pageshow', () => {
    if (!properties.some((property) => property.id === propertySelect.value)) {
      setCurrentProperty(DEFAULT_PROPERTY_ID);
    }
  });
}

function handlePropertyChange(event) {
  const selectedId = event?.target?.value ?? propertySelect.value;
  setCurrentProperty(selectedId);
  window.history.replaceState({}, '', buildPropertyUrl(selectedId));
}

function setCurrentProperty(propertyId, options = { updateUrl: true }) {
  const selected = properties.find((property) => property.id === propertyId) ?? properties.find((property) => property.id === DEFAULT_PROPERTY_ID) ?? properties[0];
  currentPropertyId = selected.id;
  if (propertySelect.value !== currentPropertyId) {
    propertySelect.value = currentPropertyId;
  }

  for (const chip of propertyQuickSwitch.querySelectorAll('.property-chip')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.propertyId === currentPropertyId));
  }

  if (options.updateUrl) {
    window.history.replaceState({}, '', buildPropertyUrl(currentPropertyId));
  }

  render();
}

function render() {
  const selected = properties.find((property) => property.id === currentPropertyId) ?? properties.find((property) => property.id === DEFAULT_PROPERTY_ID) ?? properties[0];
  const nowInSouthAfrica = getSouthAfricaTimeParts();

  propertyName.textContent = `${selected.name} · ${nowInSouthAfrica.display}`;

  const shortlisted = venues
    .map((venue) => {
      const distanceKm = calculateDistanceKm(selected.coords, venue.coords);
      const openNow = isOpenNow(venue.hours, nowInSouthAfrica);
      const rankingScore = calculateGoogleRankingScore(venue.googleRating, venue.googleReviewCount);
      return { ...venue, distanceKm, openNow, rankingScore, mapsUrl: buildGoogleMapsUrl(venue) };
    })
    .filter((venue) => venue.distanceKm <= 5 && venue.openNow)
    .sort((a, b) => b.rankingScore - a.rankingScore);

  venueCount.textContent = String(shortlisted.length);

  const byCategory = Object.keys(categoryLabels).map((category) => ({
    label: categoryLabels[category],
    venues: shortlisted.filter((venue) => venue.category === category).slice(0, 3)
  }));

  results.innerHTML = '';

  for (const entry of byCategory) {
    const categoryTemplate = document.querySelector('#category-template');
    const venueTemplate = document.querySelector('#venue-template');
    const categoryFragment = categoryTemplate.content.cloneNode(true);
    const heading = categoryFragment.querySelector('h3');
    const list = categoryFragment.querySelector('ul');
    heading.textContent = entry.label;

    if (!entry.venues.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No open options within 5km right now. Concierge can arrange next-available alternatives.';
      list.replaceWith(empty);
    } else {
      for (const venue of entry.venues) {
        const venueFragment = venueTemplate.content.cloneNode(true);
        venueFragment.querySelector('h4').textContent = venue.name;
        venueFragment.querySelector('.distance').textContent = `${venue.distanceKm.toFixed(1)} km`;
        venueFragment.querySelector('.meta').textContent = `Google ${venue.googleRating.toFixed(1)}★ (${venue.googleReviewCount.toLocaleString()} reviews) · Source: ${venue.bookingSource} · Rank ${venue.rankingScore.toFixed(1)}`;
        const tripadvisorLine = venueFragment.querySelector('.tripadvisor');
        if (venue.tripAdvisorRating) {
          tripadvisorLine.textContent = `Tripadvisor ${venue.tripAdvisorRating.toFixed(1)}★ (${(venue.tripAdvisorReviewCount ?? 0).toLocaleString()} reviews)`;
        } else {
          tripadvisorLine.textContent = 'Tripadvisor rating not currently available';
        }
        venueFragment.querySelector('.availability').textContent = venue.availability;

        const photo = venueFragment.querySelector('.venue-photo');
        bindVenuePhoto(photo, venue);

        const bookingLink = venueFragment.querySelector('.booking-link');
        bookingLink.href = venue.bookingUrl;

        const mapsLink = venueFragment.querySelector('.maps-link');
        mapsLink.href = venue.mapsUrl;

        list.append(venueFragment);
      }
    }

    results.append(categoryFragment);
  }
}


function getInitialPropertyId() {
  const selectedFromUrl = new URLSearchParams(window.location.search).get('property');
  return properties.some((property) => property.id === selectedFromUrl) ? selectedFromUrl : DEFAULT_PROPERTY_ID;
}

function buildPropertyUrl(propertyId) {
  const url = new URL(window.location.href);
  url.searchParams.set('property', propertyId);
  return `${url.pathname}${url.search}`;
}

function calculateGoogleRankingScore(googleRating, googleReviewCount) {
  const ratingComponent = googleRating * 20;
  const confidenceComponent = Math.min(10, Math.log10(Math.max(1, googleReviewCount)) * 3);
  return ratingComponent + confidenceComponent;
}

function defaultHours(open, close) {
  return { mon: [[open, close]], tue: [[open, close]], wed: [[open, close]], thu: [[open, close]], fri: [[open, close]], sat: [[open, close]], sun: [[open, close]] };
}

function getSouthAfricaTimeParts() {
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === 'weekday')?.value.toLowerCase().slice(0, 3);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  return {
    weekday: weekdayKeys.includes(weekday) ? weekday : 'mon',
    minutesSinceMidnight: hour * 60 + minute,
    display: `SAST ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  };
}

function isOpenNow(hours, now) {
  const ranges = hours[now.weekday] ?? [];
  return ranges.some(([open, close]) => {
    const openMinutes = toMinutes(open);
    const closeMinutes = toMinutes(close);
    if (closeMinutes >= openMinutes) {
      return now.minutesSinceMidnight >= openMinutes && now.minutesSinceMidnight <= closeMinutes;
    }
    return now.minutesSinceMidnight >= openMinutes || now.minutesSinceMidnight <= closeMinutes;
  });
}

function toMinutes(value) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function getPhotoCandidates(venue) {
  const entityPlaceholder = buildEntityPlaceholderUrl(venue);
  if (venue.photoUrl.startsWith('assets/')) {
    const localAssetUrl = new URL(venue.photoUrl, window.location.href).href;
    return [localAssetUrl, entityPlaceholder];
  }

  const proxiedPhoto = buildImageProxyUrl(venue.photoUrl);
  const websiteScreenshot = buildWebsiteScreenshotUrl(venue);
  const websiteScreenshotAlt = buildWebsiteScreenshotAltUrl(venue);
  const tripadvisorScreenshot = buildTripadvisorScreenshotUrl(venue);
  const categoryPhoto = buildCategoryPhotoFallbackUrl(venue);
  return [venue.photoUrl, proxiedPhoto, websiteScreenshot, websiteScreenshotAlt, tripadvisorScreenshot, categoryPhoto, entityPlaceholder];
}

function buildImageProxyUrl(photoUrl) {
  const withoutProtocol = photoUrl.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}&w=1280&h=800&fit=cover`;
}

function getEntityWebsiteUrl(venue) {
  const primary = venue.websiteUrl ?? venue.bookingUrl;
  try {
    const parsed = new URL(primary);
    return parsed.origin;
  } catch {
    return primary;
  }
}

function buildWebsiteScreenshotUrl(venue) {
  const websiteUrl = getEntityWebsiteUrl(venue);
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(websiteUrl)}?w=1280`;
}

function buildWebsiteScreenshotAltUrl(venue) {
  const websiteUrl = getEntityWebsiteUrl(venue);
  return `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodeURIComponent(websiteUrl)}`;
}


function buildTripadvisorSearchUrl(venue) {
  const query = encodeURIComponent(`${venue.name} ${venue.city}`);
  return `https://www.tripadvisor.com/Search?q=${query}`;
}

function buildTripadvisorScreenshotUrl(venue) {
  const searchUrl = buildTripadvisorSearchUrl(venue);
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(searchUrl)}?w=1280`;
}


function buildCategoryPhotoFallbackUrl(venue) {
  const seed = encodeURIComponent(`${venue.name}-${venue.category}-${venue.city}`);
  return `https://picsum.photos/seed/${seed}/1280/800`;
}

function buildEntityPlaceholderUrl(venue) {
  const label = encodeURIComponent(`${venue.name} | ${venue.city}`);
  return `https://dummyimage.com/1280x800/2b2721/f8f5ef.png&text=${label}`;
}

function buildInlineFallbackImage(venue) {
  const title = escapeHtml(venue.name);
  const subtitle = escapeHtml(venue.city);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2b2721" /><stop offset="100%" stop-color="#9f8358" /></linearGradient></defs><rect width="640" height="400" fill="url(#bg)" /><text x="50%" y="47%" fill="#f8f5ef" font-size="34" text-anchor="middle" font-family="Georgia, serif">${title}</text><text x="50%" y="58%" fill="#f2ede3" font-size="22" text-anchor="middle" font-family="Arial, sans-serif">${subtitle}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function bindVenuePhoto(photoElement, venue) {
  const candidates = getPhotoCandidates(venue);
  const inlineFallback = buildInlineFallbackImage(venue);
  let candidateIndex = 0;

  photoElement.alt = `${venue.name} in ${venue.city}`;
  photoElement.referrerPolicy = 'no-referrer';
  photoElement.crossOrigin = 'anonymous';
  photoElement.addEventListener('error', () => {
    candidateIndex += 1;
    photoElement.src = candidates[candidateIndex] ?? inlineFallback;
  }, { once: false });
  photoElement.src = candidates[candidateIndex] ?? inlineFallback;
}

function buildGoogleMapsUrl(venue) {
  const query = encodeURIComponent(`${venue.coords.lat},${venue.coords.lng} (${venue.name})`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function calculateDistanceKm(a, b) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const first = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const second = 2 * Math.atan2(Math.sqrt(first), Math.sqrt(1 - first));
  return earthRadiusKm * second;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
