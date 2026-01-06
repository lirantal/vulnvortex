# Contributing to Dependency Frost (VulnVortex)

Thank you for your interest in contributing to Dependency Frost! This guide will help you get started with setting up the project locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/snyk-labs/vulnvortex.git
cd vulnvortex
```

### 2. Install Dependencies

Use `npm ci` for a clean, reproducible install based on the lockfile:

```bash
npm ci
```

> **Note:** Always use `npm ci` instead of `npm install` to ensure you have the exact dependency versions specified in `package-lock.json`.

### 3. Run the Development Server

```bash
npm start
```

Or alternatively:

```bash
npm run dev
```

### 4. Open in Browser

Once the server is running, open your browser and navigate to:

```
http://localhost:8000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm run dev` | Same as `npm start` |
| `npm run build` | Build the project for production |

## Project Structure

```
vulnvortex/
├── code/           # Game source code
│   └── main.js     # Main game entry point
├── sprites/        # Game graphics and images
├── sounds/         # Audio files
├── fonts/          # Custom fonts
├── images/         # Static images
├── api/            # API endpoints
├── run.js          # Development server
├── build.js        # Build script
├── helper.ts       # Helper utilities
└── template.html   # HTML template
```

## Development Tips

- The game is built with [Kaplay](https://kaplayjs.com/) (successor to Kaboom.js)
- Use `Cmd + S` (Mac) or `Ctrl + S` (Windows/Linux) in your editor to trigger a refresh in the browser
- The server automatically rebuilds the game when you access the root URL

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to learn and build something fun together!

## Questions?

If you have questions or run into issues, feel free to open an issue on GitHub.

