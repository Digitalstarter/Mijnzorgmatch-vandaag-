# MijnZorgMatch.nl Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from professional matching platforms (LinkedIn, Care.com, Upwork) while maintaining healthcare-specific trust and warmth. The design balances professional credibility with approachable human connection.

**Core Principle**: Create a trustworthy, efficient platform where healthcare professionals, organizations, and families can confidently connect. Design must communicate professionalism, safety, and ease of use.

---

## Typography System

**Primary Font**: Inter or DM Sans (Google Fonts)
- Clean, professional, excellent readability for Dutch language
- Modern sans-serif communicating trust

**Secondary Font**: Same family with weight variations

**Hierarchy**:
- Hero Headlines: text-5xl to text-6xl, font-bold (56-60px)
- Section Headlines: text-3xl to text-4xl, font-semibold (30-36px)
- Card Titles: text-xl, font-semibold (20px)
- Body Text: text-base, font-normal (16px)
- Small Text/Labels: text-sm, font-medium (14px)
- Captions: text-xs (12px)

---

## Spacing System

**Tailwind Units**: Use 4, 6, 8, 12, 16, 20, 24 as primary spacing values

**Layout Rhythm**:
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6 to gap-8
- Element margins: mb-4, mb-6, mb-8 for vertical flow

**Container Strategy**:
- Max-width: max-w-7xl for main content
- Max-width: max-w-4xl for reading content
- Full-width: Sections with inner containers

---

## Layout Architecture

### Landing Page Structure (7 sections)

1. **Hero Section** (80vh)
   - Split layout: Left (60%) headline + CTA, Right (40%) hero image
   - Image: Warm photo of caregiver with elderly person or child (authentic, Dutch context)
   - Headline emphasizing "De juiste zorgmatch"
   - Dual CTAs: "Start als ZZP'er" + "Vind zorg"
   - Trust indicator: "Meer dan X professionals al actief"

2. **How It Works** (3-column grid on desktop)
   - Role-based cards for each user type
   - Icons representing each role
   - 3-step process per card
   - Clean, scannable format

3. **For Professionals Section**
   - 2-column: Left (feature list with checkmarks), Right (dashboard preview image)
   - Benefits specific to ZZP healthcare workers
   - Stats: opdrachten, gemiddelde responstijd

4. **For Organizations Section**
   - Reversed 2-column: Left (platform interface preview), Right (benefits)
   - Emphasis on quality matches and efficiency

5. **For Families Section**
   - 2-column: Left (benefits), Right (profile browsing preview)
   - Safety and trust messaging prominent
   - Verification badges highlighted

6. **Testimonials** (3-column grid)
   - Photos of real users (diverse age range)
   - Role badges (ZZP'er, Ouder, Organisatie)
   - Short, authentic quotes
   - Names and locations

7. **CTA + Footer**
   - Centered CTA section with dual signup options
   - Comprehensive footer: Quick links, Contact info, Trust badges
   - Newsletter signup for zorgnieuws
   - Social proof: "Erkend door [zorg authorities]"

### Dashboard Layouts (Post-Login)

**Shared Dashboard Structure**:
- Top navigation: Logo, Search, Messages (badge), Profile dropdown
- Sidebar (left, 240px): Role-specific navigation items
- Main content area: max-w-6xl, centered
- Quick stats cards at top (3-4 column grid)

**ZZP'er Dashboard**:
- Feed layout: Vacatures and hulpvragen in card format
- Filters sidebar (collapsible on mobile)
- "Mijn Reacties" section below feed
- Profile completion widget (sticky on scroll)

**Organisation Dashboard**:
- "Mijn Vacatures" table view with status indicators
- "Nieuwe Reacties" notification cards
- Analytics widgets (views, responses, matches)
- CTA to post new vacancy

**Parent/Caregiver Dashboard**:
- Gallery grid of ZZP'er profiles (3-column on desktop)
- Search and filter top bar
- "Mijn Advertenties" sidebar widget
- Saved profiles section

---

## Component Library

### Cards
- **Profile Cards**: Rounded-lg, shadow-sm, hover:shadow-md transition
  - Avatar (large, circular) top or left
  - Name, role, specialization
  - Rating stars + review count
  - Key tags (max 3-4 visible)
  - CTA button bottom
  - Padding: p-6

- **Job/Request Cards**: Rounded-lg, border treatment
  - Organization logo or parent initial avatar
  - Title (prominent)
  - Location + date posted
  - Brief description (3 lines max)
  - Tags for requirements
  - "Reageer" button
  - Padding: p-5

- **Message Preview Cards**: Border-left accent
  - Avatar + name
  - Message preview (1 line)
  - Timestamp
  - Unread indicator (badge)

### Forms
- **Input Fields**: 
  - Border with focus:ring treatment
  - Labels above inputs (text-sm, font-medium)
  - Placeholder text (subtle)
  - Helper text below when needed
  - Error states with text-red messaging
  - Consistent height: h-11 to h-12

- **Select Dropdowns**: Match input styling
- **Textareas**: Min height h-32, resize-y
- **Checkboxes/Radio**: Custom styled, accessible
- **File Upload**: Drag-and-drop zone with preview

### Navigation
- **Top Nav**: Sticky, backdrop-blur-sm when scrolling
  - Height: h-16 to h-20
  - Horizontal spacing between items: gap-8
  - Logo left, menu items center, user actions right
  
- **Sidebar Nav**: 
  - Icons + labels for each item
  - Active state: Background treatment + border-left accent
  - Hover states: Subtle background
  - Collapsible on tablet

### Buttons
- **Primary CTA**: Rounded-lg, px-6, py-3, font-semibold
- **Secondary**: Outlined variant with border-2
- **Ghost**: Text only with hover background
- **Icon Buttons**: Rounded-full, p-2 to p-3
- **Button Groups**: Joined with rounded corners on ends only

### Modals & Overlays
- **Modal**: Centered, max-w-lg to max-w-2xl, rounded-xl
  - Backdrop with backdrop-blur-sm
  - Padding: p-6 to p-8
  - Close button (icon) top-right
  
- **Dropdown Menus**: Rounded-lg, shadow-lg
  - Items with hover:background
  - Dividers between sections
  - Icons left-aligned with text

### Badges & Tags
- **Status Badges**: Rounded-full, px-3, py-1, text-xs, font-medium
  - Variants: Nieuw, Actief, Vervuld, Concept
- **Skill Tags**: Rounded-md, px-2.5, py-1, text-sm
  - Maximum 3-4 visible, "+X meer" for overflow

### Data Display
- **Stats Cards**: Rounded-lg, p-6
  - Large number (text-3xl, font-bold)
  - Label below (text-sm)
  - Optional trend indicator
  
- **Tables**: Responsive, striped rows optional
  - Header: font-semibold, text-sm, uppercase tracking
  - Row padding: py-4
  - Mobile: Stack to cards

### Chat Interface
- **Chat Container**: Split view on desktop
  - Left: Conversation list (w-80)
  - Right: Active conversation
  - Mobile: Single view with back navigation

- **Message Bubbles**: Rounded-2xl
  - Sent: Aligned right, max-w-md
  - Received: Aligned left, max-w-md
  - Timestamp below (text-xs)
  - Avatar for received messages

---

## Images

### Hero Image
- **Placement**: Right side of hero section (40% width on desktop)
- **Description**: Warm, professional photo showing caregiver interaction - either ZZP professional with elderly client or parent-child scenario. Natural lighting, Dutch setting, authentic moment
- **Treatment**: Rounded-xl, subtle shadow

### Section Images
- **Dashboard Previews**: Screenshots/mockups of actual platform interfaces showing cards, listings, filters
- **Process Illustrations**: Simple, friendly illustrations for "How It Works" section (optional - can use icons)
- **Testimonial Photos**: Real user photos (headshots), circular crop, consistent size

### Profile Avatars
- **Default**: Initials on gradient background when no photo
- **Uploaded**: Circular crop, consistent sizing across platform

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Base (< 768px)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)
- Wide: xl: (1280px+)

**Mobile Adaptations**:
- Navigation: Hamburger menu, full-screen overlay
- Cards: Full width, stacked
- Hero: Stacked layout, image below headline
- Sidebars: Bottom sheets or collapsible
- Tables: Transform to cards

---

## Accessibility Standards

- **Focus States**: Visible ring on all interactive elements
- **Color Contrast**: WCAG AA minimum for all text
- **Touch Targets**: Minimum 44x44px on mobile
- **Keyboard Navigation**: Full keyboard support, logical tab order
- **Screen Readers**: Semantic HTML, ARIA labels where needed
- **Form Labels**: Always visible, properly associated

---

## Animation Philosophy

**Minimal, Purposeful Motion**:
- Page transitions: Simple fade (200ms)
- Card hover: Slight lift with shadow (150ms ease)
- Modal entry: Scale + fade (200ms)
- Loading states: Subtle pulse or spinner
- **No**: Parallax, complex scroll animations, auto-playing carousels

---

This design creates a professional, trustworthy platform that serves all three user types effectively while maintaining visual consistency and ease of use.