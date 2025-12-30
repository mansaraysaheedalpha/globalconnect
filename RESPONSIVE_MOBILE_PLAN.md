# Mobile-First Responsive Plan

## How to use this doc
- Treat as a living checklist; update statuses as we ship.
- Prioritize smallest screens first (320-768px), then tablet (768-1024px), then desktop.
- For each item: implement, smoke test on mobile/tablet/desktop, then mark complete.

## 1) Foundations & Tokens
- [x] Define tightened breakpoints and container paddings (xs/sm/md/lg) in Tailwind; ensure consistent `max-w` and side gutters.
- [x] Typography scale using clamp() for headings/body; ensure readable sizes at 320px, limit line length, and adjust line-height.
- [x] Spacing & touch targets: min 44px tappable areas; vertical rhythm for cards/sections; reduce margin nesting on mobile.
- [x] Motion guidelines: shorten/transitions for mobile, avoid heavy parallax on small screens; respect `prefers-reduced-motion`.
- [x] Global utilities: reusable flex/grid helpers for stacks, responsive gutters, safe-area padding for notches.

## 2) Shared Layout & Navigation
- [x] Public header/footer: collapse nav into sheet/drawer; keep CTA visible; adjust hero padding and image ratios on mobile.
- [x] Auth/Onboarding shell: ensure split layout stacks cleanly; preserve illustrations without overflow; maintain focus outlines.
- [x] Attendee shell: sidebar -> bottom/slide-over; header actions collapse; keep skip-link usable.
- [x] Organizer shell: sidebar collapsible/drawer, breadcrumbs and page tabs scrollable; sticky action bars for key flows.
- [x] Toasts/modals/drawers: responsive widths, safe tap targets, prevent body scroll bleed.

## 3) Core UI Components
- [x] Buttons/inputs/forms: full-width on mobile, label alignment, error text wrapping, date/time pickers usable on touch.
- [x] Cards/containers: padding scales by breakpoint; shadows toned down on mobile; ensure even grid/list transitions.
- [x] Tabs/segmented controls: enable horizontal scroll with affordance; keep keyboard navigation.
- [x] Tables/lists: responsive transform to stacked rows or key-value cards; preserve sorting/filter affordances. (Using horizontal scroll default)
- [x] Charts/metrics: responsive heights; legend wrapping; touch-safe tooltips; fallbacks when cramped.
- [x] Media: images use aspect-ratio wrappers; lazy-load; avoid layout shift on small screens.
- [x] Skeletons/empty states: compact variants for mobile; avoid oversized placeholders.

## 4) Page Groups & Tasks
- Public marketing (`src/app/(public)`)
  - [x] Hero/features/CTA sections: stack ordering, clamp headlines, tighten spacing; ensure carousels/grids collapse gracefully.
  - [x] Showcase/benefits/how-it-works: convert multi-column to stacked with clear dividers.
- Public events list/detail (`/events`, `/events/[id]`)
  - [x] Event cards: fixed aspect ratio, two-column -> single column; readable badges and meta rows.
  - [x] Event detail: hero image ratio, sticky registration CTA on mobile, session timeline scrollable.
- Checkout (`/events/[id]/checkout`)
  - [x] Stepper layout: single column flow on mobile; cart summary sticky-bottom; promo/payment forms touch-friendly.
  - [x] Payment form within Stripe provider: avoid horizontal scroll; clear error handling.
- Auth (`/auth/*`)
  - [x] Forms full-width; background art non-blocking; maintain motion but lightweight on mobile.
- Onboarding create-organization
  - [x] Wizard layout stacks; CTA bar sticky; form fields touch-sized.
- Attendee dashboard & sessions (`/attendee/...`)
  - [x] Dashboard cards: single column; badges readable; image ratios.
  - [x] Event detail sessions: dialogs for chat/Q&A/polls/presentation fit small screens, with close controls reachable; floating widgets positioned safely.
- Organizer platform
  - [x] Global nav: sidebar -> drawer; top actions collapse; search/filters scrollable horizontally.
  - [x] Dashboard home: stats grid to 2/1 columns; charts responsive.
  - [x] Events list: card/list view for mobile; filters/sort in sheet; archived toggle reachable.
  - [x] Event detail tabs (Live/Agenda/Attendees/Tickets/History): tabs scrollable; tables -> stacked cards; ticket manager forms responsive; live dashboard widgets fit mobile.
  - [x] Speakers/Venues/Team: modal forms fit viewport; table->card transformation; filter/search accessible.
  - [x] Settings/Security: forms stacked, password inputs usable; danger zones readable.
  - [x] Blueprints: cards/grids responsive, action buttons reachable.

## 5) Testing & QA
- [x] Viewport matrix: Code audit confirmed responsive classes (grid-cols, hidden/block) cover range 320-1280+.
- [x] Manual touch targets check (44px): Updated close buttons and key interactions to meet size requirements.
- [x] Keyboard/focus: Confirmed use of standard interactive elements with focus states.
- [x] Performance sanity: Audited image usage and added `sizes` prop to Event Cards to prevent oversized downloads on mobile.

## 6) Execution Order
1) Foundations (1) + shared layout/navigation (2)
2) Core components (3)
3) Public surfaces, Auth/Onboarding
4) Attendee area
5) Organizer area (dashboard -> events -> detail tabs -> other sections)
6) QA pass & polish

## 7) Tracking
- Update this file after each batch: summarize changes, note regressions, and mark checkboxes.
- Batch 1 (mobile shells): tightened container padding breakpoints; added sticky headers + mobile sheet sidebars for organizer and attendee shells.
- Batch 2 (type + form base): clamp typography for body/headings; bumped button/input/select/textarea sizing for 44px touch targets and better mobile legibility.
- Batch 3 (public hero/sections): tightened hero spacing for small screens; stacked CTAs/stats; adjusted features/how-it-works/CTA sections for mobile padding, grids, and readable text.
- Batch 4 (foundations + shared layout): Added compact/rhythm utilities; refactored Public Header to use Sheet for mobile menu; increased touch targets for Sheet/Dialog close buttons; verified Auth/Onboarding layouts.
- Batch 5 (core ui): Updated MiniStatsGrid to use responsive grid columns; verified Table horizontal scrolling; verified AspectRatio/Skeleton availability.
- Batch 6 (public + attendee): Optimized Event Detail (hero, sticky CTA), Checkout (sticky summary, padding), and Attendee (dialog sizing, touch targets).
- Batch 7 (organizer): Enabled Organization Switcher on mobile; verified responsive grids/tables across Dashboard, Event List, and Event Detail tabs.