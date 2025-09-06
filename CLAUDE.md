# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Moonvalley UI project - a professional, filmmaker-oriented web application for AI video generation and editing. The UI follows Apple/Adobe-grade design standards with a subtle retro sci-fi aesthetic.

## Architecture

### Core Structure
- **Single Component Architecture**: The entire application is contained in `index.tsx` as a monolithic React component
- **Stack**: React + Tailwind CSS + shadcn/ui components + lucide-react icons
- **No Backend**: Currently frontend-only with placeholder behaviors for UI demonstration
- **State Management**: Local React state (useState, useRef, useEffect hooks)

### Key UI Sections
1. **Shot Panel (Left)**: Contains prompt controls, model selection, and generation button
2. **Canvas (Center)**: Main viewport with aspect ratio guides, drag-drop support, and various tool modes
3. **Timeline (Bottom)**: Keyframe management, playback controls, and outputs gallery
4. **Right Panels**: Library, presets, references/palette, and advanced settings

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## Key Implementation Details

### Design System
- **Primary Color**: Baby blue (#aee2ff) used for outlines, highlights, and accents
- **Panel Style**: Dark neutral panels with translucency (bg-neutral-900/50)
- **Animations**: Spring-based transitions using custom CSS keyframes
- **Grid Texture**: Subtle grid overlay for canvas area

### Core Features
- **Drag & Drop**: Supports both native files and internal library items (application/x-library)
- **Keyframes**: Array structure with `{id, frame, thumb?, styleNote?, styleRef?}`
- **Timeline**: Frame-based with seconds markers, draggable keyframes with thumbnails
- **Camera Control**: 3D grid visualization with XYZ gizmo and preset movements
- **Tools**: 11 specialized tools for video manipulation (Text/Image to Video, Motion Transfer, Camera Control, etc.)

### State Structure
```typescript
type Keyframe = { id: number; frame: number; thumb?: string; styleNote?: string; styleRef?: string };
type GalleryItem = { id: number; thumb: string | null; title: string; duration: string; src: string };
type Camera = { yaw: number; pitch: number; roll: number };
```

### Performance Considerations
- Drag operations throttled with requestAnimationFrame (rAF)
- Smooth spring animations via CSS cubic-bezier curves
- Minimal layout thrashing through careful state management

## Important Patterns

### Tool Selection
Tools are defined in an array and rendered dynamically. The active tool determines canvas behavior and available controls.

### Prompt Enhancement
The `eText` function transforms basic prompts into cinematic descriptions with technical details (lens, lighting, motion, palette).

### Aspect Ratio Handling
The `fitAR` function maintains aspect ratios while fitting content to available space. Supported ratios: 16:9, 4:3, 1:1, 9:16, 2.39:1.

### Animation System
Custom CSS animations defined inline for:
- Shutter effects (ring + crosshair)
- Spring transitions (scale-based bounce)
- Slide-in reveals
- Keyframe pop effects

## UI/UX Guidelines

When modifying the UI:
1. Maintain the baby blue (#aee2ff) accent color consistently
2. Use dark neutral backgrounds with subtle transparency
3. Apply 1px solid outlines for active/focused states
4. Implement spring-based animations for user feedback
5. Keep the filmmaker-oriented language (Shot, Style Frame, Reframe)