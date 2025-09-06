# Moonvalley UI — Professional AI Video Generation Interface

A filmmaker-oriented web application for AI video generation and editing with Apple/Adobe-grade UI and retro sci-fi aesthetics.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **lucide-react** for icons
- **Radix UI** primitives

## Project Structure

```
src/
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   └── utils.ts      # Utility functions
├── App.tsx           # Main Moonvalley UI component
├── main.tsx          # Application entry point
└── index.css         # Global styles and Tailwind directives
```

## Features

- 11 specialized video generation tools
- Drag-and-drop media import
- Timeline with keyframe management
- 3D camera controls
- Style frames and references
- Real-time preview
- Advanced AI parameters

## Notes

- No external API calls (UI demonstration only)
- All assets and icons bundled locally
- Responsive dark-themed interface
- Spring-based animations throughout
