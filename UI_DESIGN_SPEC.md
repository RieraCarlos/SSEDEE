# 🎨 UI/UX Design Specification - UpdateNominaModal

## 📱 Desktop View (≥ md breakpoint)

```
┌────────────────────────────────────────────────────────┐
│                                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃  Actualizar Nómina                            ✕  ┃   │
│  ┃  Real Madrid (Team Name)                         ┃   │
│  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫   │
│  ┃                                                    ┃   │
│  ┃  🔍 Buscar jugador...                             ┃   │
│  ┃                                                    ┃   │
│  ┃  ┌─────────────────────────────────────────────┐  ┃   │
│  ┃  │ ☑ Cristiano Ronaldo                        │  ┃   │
│  ┃  │   cristiano@email.com                      │  ┃   │
│  ┃  └─────────────────────────────────────────────┘  ┃   │
│  ┃                                                    ┃   │
│  ┃  ┌─────────────────────────────────────────────┐  ┃   │
│  ┃  │ ☑ Xavi Hernández                          │  ┃   │
│  ┃  │   xavi@email.com                          │  ┃   │
│  ┃  └─────────────────────────────────────────────┘  ┃   │
│  ┃                                                    ┃   │
│  ┃  ┌─────────────────────────────────────────────┐  ┃   │
│  ┃  │ ☐ David de Gea                             │  ┃   │
│  ┃  │   degea@email.com                          │  ┃   │
│  ┃  └─────────────────────────────────────────────┘  ┃   │
│  ┃                                                    ┃   │
│  ┃  Seleccionados (2)                                ┃   │
│  ┃  ┌─────────────────────────────────────────────┐  ┃   │
│  ┃  │ ✓ Cristiano Ronaldo          [Trash]       │  ┃   │
│  ┃  │   cristiano@email.com                      │  ┃   │
│  ┃  └─────────────────────────────────────────────┘  ┃   │
│  ┃  ┌─────────────────────────────────────────────┐  ┃   │
│  ┃  │ ✓ Xavi Hernández              [Trash]     │  ┃   │
│  ┃  │   xavi@email.com                          │  ┃   │
│  ┃  └─────────────────────────────────────────────┘  ┃   │
│  ┃                                                    ┃   │
│  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫   │
│  ┃  [Cancelar]                   [+ Guardar]        ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile View (< md breakpoint)

```
┌──────────────────────────────┐
│  Actualizar Nómina      ✕    │
│  Real Madrid                 │
├──────────────────────────────┤
│                              │
│  🔍 Buscar jugador...        │
│                              │
│  ┌────────────────────────┐  │
│  │ ☑ Cristiano Ronaldo   │  │
│  │   cristiano@email.com │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ ☑ Xavi Hernández      │  │
│  │   xavi@email.com      │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ ☐ David de Gea        │  │
│  │   degea@email.com     │  │
│  └────────────────────────┘  │
│                              │
│  Seleccionados (2)           │
│  ┌────────────────────────┐  │
│  │ ✓ Cristiano Ronaldo   │  │
│  │   cristiano@email... │  │
│  │              [trash]  │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ ✓ Xavi Hernández      │  │
│  │   xavi@email.com      │  │
│  │              [trash]  │  │
│  └────────────────────────┘  │
│                              │
├──────────────────────────────┤
│  [Cancelar]  [+ Guardar]    │
└──────────────────────────────┘
```

---

## 🎨 Color Palette

```
Component          Color Code   RGB/Hex      Usage
────────────────────────────────────────────────────────
Primary Bg         #13161c      Dark Navy    Body background
Secondary Bg       #1d2029      Dark Gray    Card/Section bg
Accent Green       #0ae98a      Bright Green Primary action/focus
Text Primary       #ffffff      White        Main text
Text Secondary     #999999      Gray         Helper text
Border Subtle      #0ae98a/20   Green 20%    Subtle borders
Border Hover       #0ae98a/50   Green 50%    Active borders
Error              #ef4444      Red          Error states
Success            #22c55e      Green        Success states
```

---

## 🔘 Button States

### Desktop Button: "Nómina"
```
┌──────────────────────────┐
│  👥 Nómina              │  NORMAL
│ (bg-[#0ae98a]/10, text-[#0ae98a])
└──────────────────────────┘

┌──────────────────────────┐
│  👥 Nómina              │  HOVER
│ (bg-[#0ae98a]/20)
└──────────────────────────┘

┌──────────────────────────┐
│  👥 Nómina              │  DISABLED
│ (opacity-50)
└──────────────────────────┘
```

### Modal Buttons
```
┌──────────────┐
│  Cancelar    │  NORMAL (bg-[#1d2029])
└──────────────┘

┌──────────────────────────┐
│  + Guardar               │  NORMAL (bg-[#0ae98a])
│                          │  Text: #13161c (dark)
└──────────────────────────┘

┌──────────────────────────┐
│  ⟳ Guardando...          │  LOADING STATE
│                          │  (Spinner + disabled)
└──────────────────────────┘

┌──────────────────────────┐
│  [Cancelar]  [+ Guardar] │  DISABLED
│  (opacity-50, cursor-not-allowed)
└──────────────────────────┘
```

---

## ✅ Checkbox States

```
UNCHECKED:
┌─┐
│ │  ← Empty box
└─┘  accent-[#0ae98a]

CHECKED:
┌─┐
│✓│  ← Check mark
└─┘  accent-[#0ae98a]

DISABLED:
┌─┐
│ │  ← Gray
└─┘  opacity-50
```

---

## 🔍 Search Input

```
NORMAL:
┌─────────────────────────────┐
│ 🔍 Buscar jugador...        │
└─────────────────────────────┘
bg-[#1d2029]
border border-[#0ae98a]/20
text-white placeholder-gray-500

FOCUSED:
┌─────────────────────────────┐
│ 🔍 Buscar...                │
└─────────────────────────────┘
border-[#0ae98a]/50
text-white

ERROR:
┌─────────────────────────────┐
│ 🔍 Error message            │
└─────────────────────────────┘
border-red-500/20
text-red-400
```

---

## 📋 Player List Item

### Available Players
```
┌─────────────────────────────────────────┐
│ ☑ Cristiano Ronaldo                    │ NORMAL
│   cristiano@email.com                  │
└─────────────────────────────────────────┘
bg-[#1d2029]
border border-[#0ae98a]/10
rounded-lg
hover:bg-[#1d2029]/80

┌─────────────────────────────────────────┐
│ ☑ Cristiano Ronaldo                    │ HOVER
│   cristiano@email.com                  │
└─────────────────────────────────────────┘
bg-[#1d2029]/80
transition-colors

┌─────────────────────────────────────────┐
│ ☐ David de Gea                         │ UNCHECKED
│   degea@email.com                      │
└─────────────────────────────────────────┘
bg-[#1d2029]
border border-[#0ae98a]/10]
```

### Selected Players Section
```
┌─────────────────────────────┐
│ Seleccionados (2)           │ TITLE
│ text-sm font-semibold       │
│ text-gray-300               │
└─────────────────────────────┘

┌──────────────────────────────────────┐
│ ✓ Cristiano Ronaldo      [trash]     │ ITEM
│   cristiano@email.com               │
└──────────────────────────────────────┘
bg-[#0ae98a]/10
border border-[#0ae98a]/20
```

---

## 🎬 Animations

### Modal Entry
```
Duration: 300ms
Type: spring (damping: 25, stiffness: 300)
From: scale(0.95) y(20px) opacity(0)
To:   scale(1) y(0px) opacity(1)
```

### Overlay Fade
```
Duration: 200ms
From: opacity(0)
To:   opacity(1)
```

### Button Hover
```
Duration: transition-colors (150ms)
```

### Loading Spinner
```
Animation: animate-spin
Color: text-[#0ae98a]
```

---

## 📐 Layout Specifications

### Desktop (≥ md)
```
Modal Width:     max-w-2xl (672px)
Modal Position:  center screen
Modal Border:    rounded-xl
Overlay:         backdrop-blur-sm
Shadow:          shadow-2xl
Padding:         px-6 py-4 (header/footer)
                 px-6 py-6 (content)
```

### Mobile (< md)
```
Modal Width:     full screen (w-full)
Modal Height:    fullscreen (h-screen)
Modal Position:  bottom
Modal Border:    No rounded (fullscreen)
Overlay:         backdrop-blur-sm
Padding:         px-4 py-4 (header/footer)
                 px-4 py-6 (content)
```

---

## 🔊 States & Transitions

### Loading State
```
Modal Content: Hidden/Grayed
Spinner:       Visible (center)
Buttons:       Disabled (opacity-50)
Message:       "Guardando..."
Duration:      Until complete
```

### Error State
```
Error Box:     Visible
Color:         bg-red-500/10, border-red-500/20
Text:          text-red-400
Icon:          None (just text)
Duration:      Until user closes modal
```

### Empty State
```
Text:          "Todos los jugadores están asignados"
Color:         text-gray-400
Size:          text-sm
Position:      Center of available users list
```

### Success State
```
Modal Closes
Transition:    Smooth fade out
Duration:      300ms
Then:          onSuccess callback
```

---

## ♿ Accessibility

```
✅ Semantic HTML
   - <label> for checkboxes
   - <input type="checkbox">
   - <button> for actions
   - ARIA labels where needed

✅ Keyboard Navigation
   - Tab through inputs
   - Enter to toggle checkboxes
   - Enter/Space on buttons

✅ Focus States
   - Visible focus outline
   - High contrast colors

✅ Color Contrast
   - Text vs background: WCAG AA compliant
   - Icons visible on all backgrounds

✅ Screen Reader
   - Descriptions for icons
   - Form labels clear
   - Dynamic content announced
```

---

## 📊 Responsive Breakpoints

```
Screen Size     Behavior
──────────────────────────────────────
< 640px         Mobile/fullscreen
640px - 1024px  Tablet/fullscreen
≥ 1024px        Desktop/centered modal
```

---

## 🎯 Focus Areas

```
1. Header
   ├─ Title visible
   ├─ Subtitle (club name) visible
   └─ Close button (X) in top right

2. Content Area
   ├─ Search input (high priority)
   ├─ Available users list (scrollable)
   ├─ Selected users section (visible)
   └─ Error messages (if any)

3. Footer
   ├─ Cancel button (left)
   └─ Save button (right, primary color)
```

---

## 💾 Data Display Format

### User Item
```
Name:   Bold, white, max-width handled (truncate)
Email:  Secondary color, smaller, truncate
Layout: Flex with gap
```

### Stats
```
Selected Count: "Seleccionados (2)"
Format:        text-sm font-semibold text-gray-300
```

---

## 🚀 Performance Visual Indicators

```
✅ Checkbox visual feedback: Immediate
✅ Search filter: Real-time (no debounce)
✅ Button states: Instant
✅ Modal animation: Smooth 300ms
✅ Loading spinner: Visible immediately
```

---

## 🎨 Design System Alignment

```
✅ Follows Dark Modern High-End aesthetic
✅ Uses consistent color palette
✅ Mobile-First responsive design
✅ Tailwind CSS utility-first approach
✅ Framer Motion for animations
✅ Lucide icons for consistency
✅ Semantic HTML structure
✅ Performance optimized
```

---

## 📸 Visual Hierarchy

```
1. MOST IMPORTANT
   └─ Modal title "Actualizar Nómina"
      Action buttons (Guardar)

2. IMPORTANT
   ├─ Search input
   ├─ Player checkboxes
   └─ Selected players section

3. SUPPORTING
   ├─ Club name (subtitle)
   ├─ Email addresses
   └─ Count badge "(2)"

4. LEAST IMPORTANT
   ├─ Borders/dividers
   ├─ Icons
   └─ Spacing
```

---

## 🔄 Modal Lifecycle Visual

```
┌─────────────────────┐
│   Modal Closed      │
└──────┬──────────────┘
       │ User clicks "Nómina"
       ↓
┌─────────────────────┐
│  Modal Animates In  │ ← scale(0.95) to scale(1)
│  (300ms spring)     │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Data Loads         │ ← fetchClubPlayers +
│  (showing spinner)  │   fetchAvailableUsers
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  User Interacts     │ ← Selects players
│  (local state)      │   Search input
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  User Saves         │ ← Click "Guardar"
│  (button disabled)  │   Spinner shows
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Data Updates       │ ← Supabase upsert
│  (updateLoading)    │   State updates
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Modal Animates Out │ ← opacity(1) to opacity(0)
│  (300ms fade)       │
└──────┬──────────────┘
       │ cleanup() called
       ↓
┌─────────────────────┐
│   Modal Closed      │
│   State Reset       │ ← clearRosterState
└─────────────────────┘
```
