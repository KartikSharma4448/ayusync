# AayuSync Design Guidelines

## Design Approach
**System-Based with Healthcare Context**: Drawing from Material Design and modern healthcare platforms (Epic MyChart, Zocdoc, telemedicine apps) to create a trustworthy, efficiency-focused interface that balances medical professionalism with accessibility.

## Typography System
- **Primary Font**: Inter or Roboto via Google Fonts (medical-grade clarity)
- **Headers**: Font weight 600-700, sizes: text-3xl (main titles), text-2xl (section headers), text-xl (subsection headers)
- **Body Text**: Font weight 400, text-base for primary content, text-sm for metadata/timestamps
- **Data/Metrics**: Font weight 500, tabular-nums for consistency in medical records and ETAs
- **Emergency Elements**: Font weight 700, text-lg+ for critical actions

## Spacing System
**Tailwind Units**: Consistently use 4, 6, 8, 12, 16, 20 for predictable rhythm
- Component padding: p-6 (cards), p-8 (containers)
- Section spacing: space-y-6 (related items), space-y-12 (distinct sections)
- Grid gaps: gap-6 (standard), gap-4 (compact lists)

## Layout Architecture

### Patient Portal
**Dashboard Layout**: Single-column mobile, two-column desktop (sidebar navigation + main content)
- Sidebar: w-64, fixed position with navigation items and user profile
- Main Content: max-w-6xl, mx-auto with p-6 to p-8
- Medical Timeline: Vertical timeline with alternating left/right cards for visual hierarchy

**Login Flow**: Centered card layout (max-w-md, mx-auto) with generous vertical spacing
- ABHA ID input → OTP simulation → Success state with smooth transitions
- Progressive disclosure: Show only current step, hide completed steps

### Dispatcher Dashboard
**Full-Screen Map Interface**: 
- Header: Fixed h-16 with stats, filters, and emergency alerts
- Map Container: Calculated height (h-[calc(100vh-4rem)]) filling remaining viewport
- Side Panel (Desktop): w-96, overlay on map with backdrop blur, showing active incidents and ambulance roster
- Mobile: Bottom sheet drawer that slides up, h-1/2 initially, expandable to h-3/4

## Component Library

### Patient Module Components

**Medical Record Cards**:
- Container: rounded-lg border shadow-sm p-6
- Header: Flex layout with document type badge, date, and doctor name
- Content: Preview text (text-sm, line-clamp-3) with "View Full Report" action
- Icons: Document type indicators (Heroicons - use document-text, beaker, clipboard-list)

**Upload Interface**:
- Drag-and-drop zone: border-2 border-dashed rounded-xl p-12 with hover states
- File preview: Grid layout (grid-cols-2 md:grid-cols-3) showing uploaded PDFs with thumbnails
- Form fields: Stacked labels (text-sm font-medium mb-2) with generous input spacing (h-12)

**QR Code Display**:
- Centered modal: max-w-sm with QR code at 256x256px
- Context text above and below QR (instructions, patient ID)
- Download/Share actions below QR code

### Emergency Module Components

**SOS Button**:
- Hero element: w-64 h-64 (mobile), w-80 h-80 (desktop), perfectly circular
- Positioned center of viewport initially, or prominent card on dashboard
- Pulsing animation (animate-pulse) in idle state
- Ripple effect on press with countdown overlay
- Confirmation modal before activating (prevent accidental triggers)

**Map Visualization**:
- Hospital Markers: Static pins with hospital icon, clickable for details popup
- Ambulance Markers: Moving dots with vehicle number labels, real-time position updates
- Incident Markers: Pulsing ring animation, showing SOS caller details on click
- Route Lines: Dashed polylines from assigned ambulance to incident
- Legend: Fixed bottom-left corner with marker type explanations

**Dispatcher Control Panel**:
- Incident Cards: Stacked list (space-y-4) with priority indicators
- Each card: Compact flex layout showing time, location, assigned ambulance, ETA
- Assignment UI: Dropdown showing 3 nearest ambulances with distance/ETA metrics
- Status badges: Pill-shaped with icons (pending, assigned, en-route, arrived)

**Distance Algorithm Display**:
- Comparison table: 3 rows showing nearest ambulances
- Columns: Ambulance ID, Current Location, Distance (km), ETA (min), Status, Action
- Auto-select closest available ambulance with visual emphasis

### Navigation & Structure

**Patient Navigation**:
- Top: Logo + User profile dropdown (right-aligned)
- Side menu items: Dashboard, Medical Records, Upload Report, Emergency SOS, Profile
- Mobile: Hamburger menu transforming to full-screen overlay

**Dispatcher Navigation**:
- Minimal header: Logo, Active Incidents count, Ambulance Status overview, User profile
- Primary focus on map; navigation as utility rather than destination

## Interaction Patterns

**Form Inputs**: 
- Standard height h-12, rounded-lg borders
- Focus states with ring-2 treatment
- Error states with text-sm helper text below (text-red-600)
- Success checkmarks inline for validation

**Buttons**:
- Primary actions: px-6 py-3, rounded-lg, font-medium
- Secondary actions: px-4 py-2, rounded-md
- Emergency/Critical: Larger touch targets (min-h-14) for accessibility

**Loading States**:
- Skeleton screens for medical record lists (animate-pulse on placeholder cards)
- Map: Loading overlay with spinner until tiles render
- Optimistic UI for uploads (show immediately, update on confirmation)

**Data Tables** (Ambulance roster, patient history):
- Responsive: Card layout on mobile, table on desktop (md:table)
- Sticky headers on desktop
- Row hover states for scanability
- Sortable columns with icon indicators

## Mobile-First Considerations
- Bottom navigation bar for patient portal (fixed bottom-0)
- SOS button easily thumb-reachable on mobile
- Map gestures: Pinch zoom, drag pan enabled
- Drawer patterns for secondary content vs. side panels on desktop
- Touch targets minimum 44x44px for medical compliance

## Accessibility & Medical Standards
- WCAG AA compliant contrast ratios throughout
- Clear focus indicators (ring-2 ring-offset-2)
- Screen reader labels for all interactive map elements
- Large, readable text (minimum text-base, never smaller than text-sm)
- Emergency button accessible via keyboard (Enter key activation)

## Images
**Patient Portal**: No hero image; dashboard-first approach prioritizing immediate access to medical data
**Dispatcher Dashboard**: Map IS the hero - full-screen Leaflet/Mapbox canvas with data overlays
**Login Screen**: Optional subtle medical illustration or abstract pattern in background (low opacity, non-distracting)