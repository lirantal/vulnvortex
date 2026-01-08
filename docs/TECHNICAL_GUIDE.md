# Vuln Vortex - Technical Development Guide

This document captures the technical design aspects and development patterns for contributing to the Vuln Vortex game.

## Project Structure

```
vulnvortex/
├── code/
│   └── main.js          # Main game logic and scene definitions
├── sprites/             # Visual assets (SVG, PNG, .pedit files)
├── sounds/              # Audio assets (MP3, WAV)
├── fonts/               # Custom font files (TTF)
├── dist/                # Built output files
├── build.js             # Build script
├── template.html        # HTML template for the game
└── api/                 # API endpoints (for sharing, invites, etc.)
```

## Game Framework

The game is built using **Kaboom.js**, a JavaScript game programming library. Understanding its core concepts is essential for making changes.

### Key Kaboom.js Concepts

#### Loading Assets

Assets are loaded at the start of the game using dedicated functions:

```javascript
// Load sprite images (supports SVG, PNG)
loadSprite("spriteName", "sprites/filename.svg")

// Load sounds
loadSound("soundName", "sounds/filename.mp3")

// Load fonts
loadFont("fontName", "fonts/filename.ttf")

// Load pedit animations
loadPedit("animationName", "sprites/filename.pedit")
```

#### Adding Game Objects

Game objects are added using the `add()` function with an array of components:

```javascript
add([
  pos(x, y),           // Position on screen
  sprite("spriteName"), // The sprite to display
  scale(0.5),          // Scale factor (0.5 = 50% size)
  rotate(0),           // Rotation in degrees
  anchor("center"),    // Anchor point for positioning
  area(),              // Makes object interactive/clickable
  color(255, 255, 255) // RGB color tint
])
```

#### Common Components

| Component | Description | Example |
|-----------|-------------|---------|
| `pos(x, y)` | Sets position | `pos(100, 200)` |
| `sprite(name)` | Displays a loaded sprite | `sprite("logo")` |
| `scale(factor)` | Scales the object | `scale(0.5)` for 50% |
| `color(r, g, b)` | Applies color/tint | `color(255, 0, 0)` for red |
| `anchor(point)` | Sets anchor point | `anchor("center")`, `anchor("topleft")` |
| `area()` | Enables collision/click detection | `area()` |
| `rotate(deg)` | Rotates object | `rotate(45)` |
| `outline(width, color)` | Adds outline | `outline(2, rgb(0, 0, 0))` |
| `text(str, opts)` | Displays text | `text("Hello", { size: 24, font: 'jersey' })` |

## Game Scenes

The game is organized into scenes defined using `scene()`:

### Main Scenes

1. **`credits-0`** - Intro/Start Screen
   - Displays the main logo
   - "Press Space to Start" button
   - Entry point for the game

2. **`game`** - Main Gameplay
   - Active gameplay happens here
   - Player controls, obstacles, scoring

3. **Game Over Screen** (inline in the lose condition)
   - Shows final score and high score
   - Displays the logo (smaller, 0.25 scale)
   - Share buttons for social media (LinkedIn, Twitter/X, Bluesky)
   - Restart button and "Learn How to Solve CTFs" button
   - Paragraph with game flavor text

### Scene Navigation

```javascript
// Define a scene
scene("sceneName", () => {
  // Scene setup code
})

// Navigate to a scene
go("sceneName")
```

## Color Constants

The project defines color constants for consistent theming:

```javascript
const SNYK_COLOR_PURPLE = [192, 96, 125]   // Muted purple/mauve accent
const SNYK_COLOR_ORANGE = [244, 143, 177]  // Pink/salmon accent (not orange despite the name)
```

Usage:
```javascript
color(...SNYK_COLOR_PURPLE)  // Spread into color component
rgb(...SNYK_COLOR_ORANGE)    // For outline colors
```

### Color Contrast Considerations

The game-over screen has a **pink background** (`#E991A8` approximately). When styling text and UI elements on this screen, ensure sufficient contrast:

| Element Type | Recommended Colors | Why |
|--------------|-------------------|-----|
| Primary text | Black `color(0, 0, 0)` | Maximum contrast on pink |
| Secondary text | White `color(255, 255, 255)` | Good contrast on pink |
| Avoid | `SNYK_COLOR_ORANGE`, light grays | Blend into pink background |

**Example**: The "HIGH SCORE" and "SHARE ON" labels use white for visibility against the pink background.

## Game Over Screen Structure

The game-over screen is defined within the game scene's lose condition. It has a layered structure with positioning based on variables:

```javascript
const XPosStart = 40                    // Left margin for most elements
const YPosStartText = 200               // Vertical starting point for text content
```

### Element Hierarchy (top to bottom)

| Element | Position | Notes |
|---------|----------|-------|
| Logo | `pos(XPosStart, 80)` | Scale 0.25 |
| "GAME OVER" | `YPosStartText` | Size 64 |
| "YOUR SCORE: X" | `YPosStartText + 80` | Purple color |
| "HIGH SCORE: X" | `YPosStartText + 80` | White color, offset to the right |
| "SHARE ON:" + icons | `YPosStartText + 135` | White color |
| Divider line | `YPosStartText + 170` | Dashes, gray |
| Paragraph text | `YPosStartText + 200` | Black color for readability |
| Buttons | `YPosStartText + 432` | Restart and CTF buttons |

### Button Styling

Buttons are created with a rectangular outline and a child text object:

```javascript
// Create button container with outline
const button = add([
  rect(200, 55, { fill: false }),        // Empty rectangle
  pos(XPosStart, YPosStartText + 432),
  area(),                                 // Enable click detection
  anchor("center"),
  outline(2, rgb(0, 0, 0)),              // Border color
  color(0, 0, 0),                        // Used for hover effects
]);

// Add text as child (centered inside button)
button.add([
  text('Button Label', { size: 22, font: 'jersey' }),
  anchor("center"),
  color(255, 255, 255),                  // Text color (white)
]);

button.onClick(() => { /* action */ });
```

## Common Modifications

### Replacing a Logo/Sprite

1. **Add the new image file** to the `sprites/` directory
2. **Update the `loadSprite()` call** in `code/main.js`:
   ```javascript
   loadSprite("logo", "sprites/new-logo.svg")
   ```
3. **Adjust scale if needed** where the sprite is used:
   ```javascript
   add([
     sprite("logo"),
     scale(0.5),  // Adjust this value
     // ...
   ])
   ```

### Adjusting Element Size

Find the `scale()` component and modify the value:
- `scale(1)` = 100% (original size)
- `scale(0.5)` = 50%
- `scale(0.25)` = 25%
- `scale(2)` = 200%

### Changing Colors

Find the `color()` component and update RGB values:
```javascript
color(255, 255, 255)  // White
color(0, 0, 0)        // Black
color(255, 0, 0)      // Red
```

### Styling Text Elements

The `text()` component accepts options for font and size:

```javascript
add([
  text("Your Text Here", {
    size: 28,           // Font size in pixels
    font: 'jersey',     // Font name (must be loaded first)
    // align: 'center', // Optional text alignment
    styles: {           // Optional: named styles for markup
      "highlight": {
        color: rgb(255, 165, 0),
      },
    }
  }),
  pos(x, y),
  color(0, 0, 0),       // Text color applied via component
])
```

Available fonts (loaded in main.js):
- `'jersey'` - Jersey10-Regular.ttf (primary game font)
- `'apl386'` - apl386.ttf
- `'VCR'` - VCR_OSD_MONO_1001.ttf

### Repositioning Elements

Modify the `pos(x, y)` component:
```javascript
pos(width()/2, height()/2)  // Center of screen
pos(100, 80)                 // Fixed position
pos(XPosStart, YPosStartText + 80)  // Using variables
```

## Screen Dimensions

The game uses helper functions for responsive positioning:
- `width()` - Returns canvas width
- `height()` - Returns canvas height

## Event Handling

### Keyboard Events
```javascript
onKeyPress("space", () => {
  // Handle spacebar press
})
```

### Click Events
```javascript
const button = add([
  // ... components
  area(),  // Required for click detection
])

button.onClick(() => {
  // Handle click
})
```

### Hover Events
```javascript
button.onHoverUpdate(() => {
  // While hovering
})

button.onHoverEnd(() => {
  // When hover ends
})
```

## Development Server

```bash
# Install dependencies
npm install

# Start development server (runs on port 8000)
npm start
```

The development server provides:
- Hot reload on file save (`Cmd+S` in editor refreshes the webview)
- Local testing at `http://localhost:8000`
- Routes: `/intro`, `/game`, `/game-over` (all redirect to main with query params)

## Building the Project

```bash
# Build the game for production
node build.js

# The built files will be in dist/
```

## File Naming Conventions

- **Sprites**: Use kebab-case, descriptive names
  - ✅ `fetch-the-flag-ctf-logo.svg`
  - ❌ `Group 1335.svg`
  
- **Sounds**: Descriptive names indicating purpose
  - ✅ `game-background-music.mp3`
  
- **Fonts**: Original font name preserved
  - ✅ `Jersey10-Regular.ttf`

## Tips for Development

1. **Use browser dev tools** to test changes quickly before rebuilding
2. **Check the console** for Kaboom.js errors if sprites don't load
3. **SVG files scale better** than PNG for logos that need multiple sizes
4. **Test on different screen sizes** since the game uses responsive positioning
5. **Keep sprite names consistent** between `loadSprite()` and `sprite()` calls
6. **Testing the game-over screen**: Play through the game and lose, or modify code temporarily to skip directly to the game-over state
7. **Color contrast**: Always test UI changes visually - the pink background on game-over can make certain colors hard to read
8. **Use `Cmd+S`** to refresh the webview after making code changes (the terminal shows this tip)

## Searching the Codebase

Key patterns for finding specific UI elements:

| To find... | Search for... |
|------------|---------------|
| Game-over screen | `scene.*lose` or `GAME OVER` |
| Score display | `YOUR SCORE` or `HIGH SCORE` |
| Share buttons | `btnShare` or `SHARE ON` |
| Main buttons | `btnRestart`, `btnStart` |
| Color constants | `SNYK_COLOR` |
| Sprite loading | `loadSprite` |

