// Pure HTML-string helpers + DOM wiring. Populated in later tasks.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function dogBadge(state) {
  if (state === true) return '<span class="badge badge--dog" title="Kai-approved">🐾 dog-friendly</span>';
  if (state === false) return '<span class="badge badge--no-dog" title="Sorry, Kai">🐾 not dog-friendly</span>';
  return '';
}

function tentativeBadge(tentative) {
  return tentative ? '<span class="badge badge--tentative">tentative</span>' : '';
}

function reservationNote(reservation) {
  return reservation ? `<span class="badge badge--reservation">${esc(reservation)}</span>` : '';
}

function badges(item) {
  return [dogBadge(item.dogFriendly), tentativeBadge(item.tentative), reservationNote(item.reservation)]
    .filter(Boolean).join(' ');
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// "2026-12-19" -> "Dec 19"; "" -> "TBD"
function fmtDate(iso) {
  if (!iso) return 'TBD';
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// Render one end of a trip (arrival/departure): "Dec 19 · 4:52pm · <flight>"
function fmtTravel(leg) {
  if (!leg) return 'TBD';
  const parts = [fmtDate(leg.date)];
  if (leg.time) parts.push(leg.time);
  if (leg.flight) parts.push(leg.flight);
  if (leg.note) parts.push(leg.note);
  return parts.join(' · ');
}

function guestCardHtml(g) {
  return `
<article class="card guest-card${g.isDog ? ' guest-card--dog' : ''}">
  <h3 class="guest-name">${esc(g.name)}${g.isDog ? ' <span class="paw">🐾</span>' : ''}</h3>
  <p class="guest-title">${esc(g.title)}</p>
  <dl class="travel">
    <div><dt>Arrives</dt><dd>${esc(fmtTravel(g.arrival))}</dd></div>
    <div><dt>Departs</dt><dd>${esc(fmtTravel(g.departure))}</dd></div>
  </dl>
</article>`;
}

function wineryCardHtml(w) {
  return `
<article class="card option-card">
  <h3>${esc(w.name)}${w.area ? ` <span class="muted">(${esc(w.area)})</span>` : ''}</h3>
  <p>${esc(w.description)}</p>
  <div class="badge-row">${badges(w)}</div>
</article>`;
}

function restaurantCardHtml(r) {
  const meta = [r.cuisine, r.price, r.area].filter(Boolean).map(esc).join(' · ');
  return `
<article class="card option-card">
  <h3>${esc(r.name)}</h3>
  <p class="muted">${meta}</p>
  <p>${esc(r.description)}</p>
  <div class="badge-row">${badges(r)}</div>
</article>`;
}

function hikeCardHtml(h) {
  const meta = [h.level, h.cost].filter(Boolean).map(esc).join(' · ');
  return `
<article class="card option-card">
  <h3>${esc(h.name)}</h3>
  <p class="muted">${meta}</p>
  <p>${esc(h.notes)}</p>
  <div class="badge-row">${badges(h)}</div>
</article>`;
}

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function calendarCellHtml(day, byId) {
  const items = day.itemIds.map(id => byId[id]).filter(Boolean);
  const dayNum = Number(day.date.split('-')[2]);
  const links = items.map(a =>
    `<a class="cal-item${a.tentative ? ' is-tentative' : ''}" href="#day-${day.date}" data-day="${day.date}">${esc(a.title)}</a>`
  ).join('');
  return `
<div class="cal-cell" data-date="${day.date}">
  <div class="cal-date">${dayNum}</div>
  <div class="cal-items">${links}</div>
</div>`;
}

function dayDetailHtml(day, byId) {
  const items = day.itemIds.map(id => byId[id]).filter(Boolean);
  const bodies = items.map(a => `
  <div class="day-item${a.tentative ? ' is-tentative' : ''}">
    <h4>${esc(a.title)}${a.time ? ` <span class="muted">${esc(a.time)}</span>` : ''}</h4>
    <p>${esc(a.description)}</p>
    ${a.bullets && a.bullets.length ? `<ul class="day-bullets">${a.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    ${a.bring ? `<p class="meta"><strong>Bring:</strong> ${esc(a.bring)}</p>` : ''}
    ${a.cost ? `<p class="meta"><strong>Cost:</strong> ${esc(a.cost)}</p>` : ''}
    <div class="badge-row">${badges(a)}</div>
  </div>`).join('');
  const header = `${WEEKDAYS[weekdayOf(day.date)]}, ${fmtDate(day.date)}`;
  return `
<section class="day-detail" id="day-${day.date}">
  <h3 class="day-header">${header}</h3>
  ${bodies || '<p class="muted">Open day — nothing planned yet.</p>'}
</section>`;
}

function el(id) { return document.getElementById(id); }

function renderNav() {
  el('nav').innerHTML = `
  <div class="nav-inner">
    <a class="monogram" href="#hero">Sonoma</a>
    <div class="nav-links">
      <a href="#guests">Guests</a>
      <a href="#calendar">Calendar</a>
      <a href="#days">Days</a>
      <a href="#options">Options</a>
      <a href="#info">Info</a>
    </div>
    <div class="nav-date">${esc(TRIP.meta.dateTag)}</div>
  </div>`;
}

function renderHero() {
  el('hero').innerHTML = `
  <div class="hero-inner">
    <img class="hero-art" src="assets/hero.svg" alt="Rolling Sonoma hills">
    <p class="label">A Carmichael-Tanaka-Medina Holiday</p>
    <h1>${esc(TRIP.meta.title)}</h1>
    <p class="hero-dates">${esc(TRIP.meta.years)}</p>
    <p class="hero-intro">${esc(TRIP.meta.intro)}</p>
  </div>`;
}

function renderCalendar(byId) {
  const leading = TRIP.calendarDays.length ? weekdayOf(TRIP.calendarDays[0].date) : 0;
  const blanks = Array.from({ length: leading }, () => '<div class="cal-cell cal-cell--blank"></div>').join('');
  const cells = TRIP.calendarDays.map(d => calendarCellHtml(d, byId)).join('');
  const heads = WEEKDAYS.map(w => `<div class="cal-head">${w}</div>`).join('');
  el('calendar').innerHTML = `
  <div class="section-inner">
    <p class="label">The Plan at a Glance</p>
    <h2>Calendar</h2>
    <p class="section-sub">Some events are set while others are tentative (italicized) pending weather and group vibes. Click any day to jump to its details. Please also note that most meals will be enjoyed at home, with the burden (honor?) of cooking being shared amongst the group. If there is a particular day you would like to take Head Chef status, please let the organizer know.</p>
    <div class="cal-grid">${heads}${blanks}${cells}</div>
  </div>`;
}

function renderDays(byId) {
  el('days').innerHTML = `
  <div class="section-inner">
    <p class="label">Day by Day</p>
    <h2>The Details</h2>
    ${TRIP.calendarDays.map(d => dayDetailHtml(d, byId)).join('')}
  </div>`;
}

function renderGuests() {
  el('guests').innerHTML = `
  <div class="section-inner">
    <p class="label">The Crew</p>
    <h2>Who's Coming</h2>
    <div class="card-grid">${TRIP.guests.map(guestCardHtml).join('')}</div>
  </div>`;
}

function renderOptions() {
  const group = (title, cards) => `
    <h3 class="options-group">${esc(title)}</h3>
    <div class="card-grid">${cards}</div>`;
  el('options').innerHTML = `
  <div class="section-inner">
    <p class="label">Mix &amp; Match</p>
    <h2>Options to Choose From</h2>
    ${group('Wineries', TRIP.options.wineries.map(wineryCardHtml).join(''))}
    ${group('Restaurants', TRIP.options.restaurants.map(restaurantCardHtml).join(''))}
    ${group('Hikes', TRIP.options.hikes.map(hikeCardHtml).join(''))}
    <!-- Deferred (spec §9): guest voting module mounts here. Add a votable:true flag in data.js
         and render a Supabase-backed live chart in this slot when ready. -->
  </div>`;
}

function renderInfo() {
  el('info').innerHTML = `
  <div class="section-inner">
    <p class="label">Good to Know</p>
    <h2>House &amp; Logistics</h2>
    <ul class="info-list">
      <li><strong>Where:</strong> ${esc(TRIP.meta.address)}</li>
      <li><strong>When:</strong> ${esc(fmtDate(TRIP.meta.startDate))} – ${esc(fmtDate(TRIP.meta.endDate))}, ${esc(TRIP.meta.years)}</li>
      <li><strong>The house:</strong> We're lucky to be staying as guests in someone's home, so let's treat it with care and leave it as we found it. It's a ranch-style place with an open-concept shared space (kitchen, dining, and living room), 4 bedrooms, and 2 bathrooms, in a quiet residential area. There's a backyard with a grill, and it's a 5-minute drive (about a 25-minute walk) from Sonoma Plaza.</li>
      <li><strong>Bathrooms:</strong> Two bathrooms — we'll designate one for the boys and one for the girls.</li>
      <li><strong>Getting around:</strong> You'll want a car — most wineries, trails, and restaurants are a short drive.</li>
      <li><strong>Packing:</strong> Layers for cool, possibly rainy late-December days; hiking shoes; something nice for a group dinner; something festive for New Year's Eve; and an optional ugly sweater for Christmas.</li>
      <li><strong>Kai:</strong> 🐾 Look for the paw — it flags dog-friendly outings. A crossed note means leave the Passenger Princess at home.</li>
    </ul>
  </div>`;
}

function renderFooter() {
  el('footer').innerHTML = `<div class="footer-inner"><p>Here's to family, wine country, and lots of laughs. 🥂🐾</p></div>`;
}

function initCalendarClicks() {
  el('calendar').addEventListener('click', (e) => {
    const link = e.target.closest('[data-day]');
    if (!link) return;
    const target = document.getElementById('day-' + link.getAttribute('data-day'));
    if (target) {
      target.classList.add('day-detail--flash');
      setTimeout(() => target.classList.remove('day-detail--flash'), 1200);
    }
  });
}

function renderAll() {
  const byId = Object.fromEntries(TRIP.activities.map(a => [a.id, a]));
  renderNav();
  renderHero();
  renderCalendar(byId);
  renderDays(byId);
  renderGuests();
  renderOptions();
  renderInfo();
  renderFooter();
  initCalendarClicks();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', renderAll);
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderAll, esc, dogBadge, tentativeBadge, reservationNote, badges,
    fmtDate, fmtTravel, guestCardHtml, wineryCardHtml, restaurantCardHtml, hikeCardHtml,
    weekdayOf, calendarCellHtml, dayDetailHtml };
}
