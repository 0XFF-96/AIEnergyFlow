# Energy Management Dashboard Design Guidelines

## Design Approach
**Reference-Based Approach**: Inspired by Grafana dashboards and Tesla's energy monitoring interface, emphasizing clarity, accessibility, and intuitive real-time data interaction for utility-focused energy management.

## Core Design Elements

### Color Palette
**Dark Mode Primary:**
- Primary: #00E0A1 (bright teal green) - 162 100% 44%
- Accent: #77E6F5 (light aqua) - 186 82% 72%
- Background: Gradient from #002d23 to #0d3d34 (deep green to black)
- Text: #FFFFFF (white)
- Secondary: #1a4a3f (medium green) - 162 43% 20%

### Typography
- Primary: Inter font family via Google Fonts CDN
- Secondary: Roboto for data-heavy displays
- Hierarchy: 
  - Headers: Inter 600 (semibold)
  - Body: Inter 400 (regular)
  - Data/Metrics: Roboto Mono for precise numerical displays

### Layout System
**Tailwind Spacing Units**: Consistent use of 4, 8, 16, and 20 (p-4, m-8, gap-16, p-20)
- Primary spacing: 20px (5 in Tailwind) for major sections
- Component spacing: 16px (4) for card padding
- Grid gaps: 8px (2) between dashboard elements

### Component Library

**Dashboard Layout:**
- Grid-based responsive layout using CSS Grid
- KPI cards with subtle borders in secondary color
- Real-time charts with teal/aqua color scheme
- Alert badges using primary green for normal status, red variants for warnings

**Navigation:**
- Dark sidebar navigation with teal accent highlights
- Breadcrumb navigation in secondary text color
- Tab navigation for different dashboard views

**Data Visualization:**
- Line charts and bar graphs using primary teal palette
- Status indicators with color-coded severity levels
- Metric cards with large typography for key values
- Progress bars and gauges in gradient teal styling

**Forms & Controls:**
- Dark input fields with teal focus states
- Toggle switches for alert preferences
- Dropdown menus with dark backgrounds
- Filter controls for time ranges and data views

**Alert System:**
- Toast notifications sliding from top-right
- Status banners for system-wide alerts
- Icon indicators using Heroicons library
- Severity levels: Success (teal), Warning (amber), Error (red)

### Visual Treatment
**Background Gradients:**
- Main dashboard: Subtle gradient from deep green (#002d23) to darker green (#0d3d34)
- Card backgrounds: Semi-transparent overlays on gradient base
- Chart backgrounds: Darker variations maintaining contrast

**Interactive Elements:**
- Subtle hover states with 10% opacity changes
- Focus rings in primary teal color
- Loading states with animated teal progress indicators

## Images
No large hero images required. This is a utility-focused dashboard application prioritizing data display over marketing visuals. Any imagery should be:
- Small icons for device status (solar panels, batteries, grid connection)
- Minimal decorative elements that don't interfere with data readability
- Status indicator graphics integrated within component designs

## Accessibility & Responsiveness
- High contrast ratios maintained across all text/background combinations
- Responsive breakpoints: Mobile-first approach with tablet and desktop optimizations
- ARIA labels for all interactive dashboard elements
- Keyboard navigation support for all controls and filters

This design approach creates a professional, data-focused interface that balances the technical requirements of energy monitoring with an intuitive user experience suitable for both operators and stakeholders.