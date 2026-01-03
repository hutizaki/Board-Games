# Nertz Scorekeeper App

A comprehensive digital scorekeeper for the fast-paced card game Nertz, built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Overview

This app serves as a scoring companion for physical Nertz gameplay. It handles all score tracking, round management, and game state while players focus on the actual card game. The app features a playful, cartoony design inspired by Bicycle's iconic orange branding.

## Features

### Home Screen
- **Team Selection**: Choose between 2-12 teams using intuitive left/right arrow controls
- **Deck Type Configuration**: Toggle between 8-pack and 12-pack deck modes via settings gear icon
- **Responsive Design**: Optimized for both iPad and iPhone devices
- **Sticker-Style Typography**: Uses Comic Sans MS for playful, game-appropriate aesthetics
- **Bicycle Orange Branding**: Primary color (#f17821) throughout the interface

### Settings
- **Deck Type Selection**:
  - **8 Pack**: 8 color options (#f40372, #fc862e, #00bb47, #fbc522, #1495e3, #a11eb0, #00cecb, #4f5457)
  - **12 Pack**: 12 color options (#ff0044, #008fd8, #4c0244, #011355, #87042b, #fdc600, #00433a, #f25fdd, #afd509, #f55607, #e500cc, #005299)
- Settings accessible via gear icon in top-right corner
- Collapsible settings panel with smooth animations

### Team Setup Phase
- **Animated Card Selection**: Cards fly in from top with rotation and spring physics
- **Color Assignment**: Each team selects their unique color from available deck colors
- **Visual Feedback**: Used colors display checkmark and reduced opacity
- **Card Dimensions**: 3:2 aspect ratio cards with proper sizing
- **Sequential Flow**: Teams pick colors one at a time in order

### Game Screen
- **Round Tracking**: Clear display of current round number
- **Score Display**: Each team's score shown in a card with their assigned color
- **NERTZ Button**: Large, prominent button for ending rounds
- **Live Score Updates**: Real-time score calculations and display
- **Return Navigation**: Back arrow to return to home screen

### Round End Flow
1. **Winner Selection**: 
   - Team that called "NERTZ" selects themselves
   - Winner is then skipped from penalty card entry
   
2. **Hand Card Entry**:
   - Each team (except winner) enters cards remaining in hand
   - Automatic calculation: Each card = -2 points
   - Large, color-coded input fields matching team colors
   - Sequential team flow with visual indicators

3. **Pile Card Entry**:
   - All teams enter cards they contributed to middle pile
   - Automatic calculation: Each card = +1 point
   - Same intuitive input interface as hand cards
   - Immediate score updates after each entry

### Scoring System
- **Hand Penalty**: -2 points per card remaining in hand
- **Pile Reward**: +1 point per card in middle pile
- **Win Condition**: First team to reach 50 points
- **Automatic Detection**: Game ends immediately when threshold is reached

### Results Screen
- **Podium Display**: 
  - 🥇 1st place
  - 🥈 2nd place
  - 🥉 3rd place
  - Numbered rankings for 4th and beyond
- **Final Scores**: Large, clear display of each team's final score
- **Team Color Cards**: Visual representation of each team
- **Animated Entry**: Staggered animations for dramatic reveal
- **New Game Button**: Quick reset to start another game

## Game States

The app manages six distinct game states:

1. **home**: Initial screen for game setup
2. **teamSetup**: Color selection for each team
3. **colorSelect**: (Legacy state, integrated into teamSetup)
4. **game**: Active gameplay with round tracking
5. **roundEnd**: Score entry after each round
6. **results**: Final rankings and scores

## User Flow

```
Home Screen
    ↓
Settings (Optional)
    ↓
Select Number of Teams
    ↓
Team 1 Picks Color → Team 2 Picks Color → ... → Team N Picks Color
    ↓
Game Screen (Round 1)
    ↓
[Physical Nertz Gameplay]
    ↓
NERTZ Button Clicked
    ↓
Select Round Winner
    ↓
Non-Winners Enter Hand Cards (-2 each)
    ↓
All Teams Enter Pile Cards (+1 each)
    ↓
Check if Any Team ≥ 50 Points
    ↓
If NO: Return to Game Screen (Next Round)
If YES: Show Results Screen
    ↓
New Game or Exit
```

## Technical Implementation

### State Management
- React `useState` hooks for all game state
- Type-safe interfaces for Teams and Game States
- Efficient state updates with immutable patterns

### Animations
- Framer Motion for all transitions and animations
- Spring physics for card entrance animations
- Staggered animations for visual appeal
- Scale transforms for interactive feedback

### Responsive Design
- Mobile-first approach
- Tailwind CSS utility classes
- Responsive text sizing (text-3xl to text-6xl)
- Flexible grid layouts (grid-cols-2, grid-cols-4)
- Touch-optimized button sizes

### Color Management
- Dynamic color assignment based on deck type
- Used color tracking to prevent duplicates
- Color-coded UI elements for team identification
- High contrast for accessibility

## Design Philosophy

### Visual Style
- **Cartoony & Playful**: Comic Sans MS font throughout
- **Sticker Aesthetic**: Bold shadows and gradients
- **Bicycle Branding**: Orange (#f17821) as primary color
- **High Contrast**: White backgrounds with vibrant team colors

### User Experience
- **Minimal Cognitive Load**: Clear, single-purpose screens
- **Visual Hierarchy**: Large typography for primary actions
- **Immediate Feedback**: Animations confirm user actions
- **Error Prevention**: Disabled states prevent invalid actions
- **Progressive Disclosure**: Information revealed when needed

### Interaction Design
- **Large Touch Targets**: Buttons optimized for fingers
- **Clear Affordances**: Buttons look clickable
- **Smooth Transitions**: AnimatePresence for state changes
- **Haptic Feedback**: Scale transforms on press (whileTap)

## Current Limitations

1. **No Persistence**: Game state is lost on refresh
2. **Single Game Session**: No game history tracking
3. **No Undo**: Cannot reverse score entries
4. **No Edit**: Team names cannot be customized
5. **Fixed Target**: 50-point threshold is hardcoded

## Future Enhancement Opportunities

### Immediate
- [ ] Add localStorage persistence
- [ ] Allow team name customization
- [ ] Implement undo/edit functionality
- [ ] Add sound effects for NERTZ button
- [ ] Include tutorial/rules screen

### Medium-Term
- [ ] Customizable point threshold
- [ ] Game statistics and history
- [ ] Multiple game profiles
- [ ] Share results functionality
- [ ] Dark mode support

### Advanced
- [ ] Multi-device sync
- [ ] Tournament mode
- [ ] Player profiles with stats
- [ ] Achievements system
- [ ] Custom deck color creator

## Technical Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Modern bundler (Vite/Create React App)
- **Type Safety**: Full TypeScript implementation

## Browser Compatibility

- ✅ iOS Safari (iPhone & iPad)
- ✅ Chrome Mobile
- ✅ Safari Desktop
- ✅ Chrome Desktop
- ✅ Edge
- ⚠️ Optimized for touch interfaces

## Installation & Usage

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Component Structure

```
NertzScorekeeper (Main Component)
├── Home Screen
│   ├── Settings Panel
│   ├── Team Counter
│   └── Start Button
├── Team Setup
│   └── Color Selection Grid
├── Game Screen
│   ├── Round Display
│   ├── Score Cards
│   └── NERTZ Button
├── Round End
│   ├── Winner Selection
│   ├── Hand Card Entry
│   └── Pile Card Entry
└── Results Screen
    ├── Podium Rankings
    ├── Final Scores
    └── New Game Button
```

## Data Models

### Team Interface
```typescript
interface Team {
  name: string;        // "Team 1", "Team 2", etc.
  color: string;       // Hex color code
  score: number;       // Current total score
  cardsInHand: number; // Last round's hand cards
  cardsInPile: number; // Last round's pile cards
}
```

### Game State Type
```typescript
type GameState = 
  | 'home' 
  | 'lobby' 
  | 'teamSetup' 
  | 'colorSelect' 
  | 'game' 
  | 'roundEnd' 
  | 'results';
```

### Deck Type
```typescript
type DeckType = '8 pack' | '12 pack';
```

## Known Issues

None currently identified. App is stable and fully functional for its intended purpose.

## Credits

- **Game**: Nertz by Bicycle Playing Cards
- **Design Inspiration**: Overcooked's cartoony aesthetic
- **Color Palette**: Bicycle brand orange (#f17821)

## License

This is a personal project scorekeeper. Nertz is a trademark of Bicycle Playing Cards.

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Platform**: Web (iOS/Android optimized)