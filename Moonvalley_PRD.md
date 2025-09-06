# Moonvalley — AI Video Generation (PRD)

## 1. Overview
**Goal:** A professional, filmmaker‑oriented desktop‑style web app for generating and editing AI video shots with a premium, Apple/Adobe-grade UI and a subtle retro sci‑fi edge.
**Primary user:** Director/Editor/Motion Designer; secondary: creative technologist.
**Outcome:** Rapid iteration on AI‑generated shots with clear prompt controls, references, timeline + keyframes, style frames, and pro camera/FX tools.

## 2. Experience Principles
- **Film-first:** language and controls match editorial/cinematography mental models (“Shot”, “Style Frame”, “Reframe”).
- **Clarity with depth:** simple defaults; panels/menus expand into advanced settings (sliders, presets).
- **Direct manipulation:** canvas-first; drag references/assets, reframe with handles, brush to sketch/erase.
- **Tasteful motion:** springy transitions, shutter “snapshot” feedback for keyframe/style actions.
- **Consistency:** baby‑blue outlines, dark neutral panels, unified panel thickness; grid texture (subtle).

## 3. Scope (MVP)
- **Shot Panel (L):** Shot name, Prompt (+Enhance), Negative Prompt, Model toggle (Fast/Quality), Generate button.
- **Canvas (C):** Aspect ratio guides, image/video drop, grid texture; modes: Reframe, Sketch to Video, Camera Control (3D grid + XYZ gizmo).
- **Toolbar (top of canvas):** tool icons w/ hover labels & selected outline. Tools: Text/Image→Video, Motion Transfer, Camera Control, Trajectory, Pose, Depth, Reframe Shot, Inpainting (brush), Background Replace, Sketch→Video, Shot Extension.
- **Timeline (bottom):** seconds track, draggable keyframe diamond + thumbnail; playhead; add/delete keyframe; skip prev/next selects keyframe; double‑click thumbnail opens Style Frame dialog; Shot Extension adds +5s hatched region; history collapsible; Outputs gallery with star (favorite).
- **Right Panels:** Library (Images/Videos/Outputs/Projects; draggable into canvas), Preset (Claymation, 2D, 3D, Cinematic, Documentary, Experimental), References/Palette (4 slots + up to 6 editable colors), Advanced (Length in seconds, Framerate, Aspect Ratio, Seed, AI parameter sliders).

## 4. User Stories & Acceptance Criteria
### 4.1 Prompting
- *As a director*, I can type a Prompt and click **Enhance prompt** to transform it into a cinematic description.
  - **AC:** Clicking Enhance replaces text with enriched template; button animates; no duplicate enrichment if already in template form.

### 4.2 Importing & References
- *As a user*, I can drag images/videos from Finder or Library into the canvas.
  - **AC:** Dropping file sets canvas media; plays videos muted/looped; triggers subtle drop glow.

### 4.3 Timeline & Keyframes
- *As an editor*, I can add a keyframe at the playhead and see a diamond above a thumbnail.
  - **AC:** “+ Add Keyframe” adds `frame = playhead`; diamond centered above thumbnail; thumbnail shows placeholder or imported image; highlight when selected; **Delete** appears only on selection.
- *As an editor*, I can drag a keyframe smoothly to new time.
  - **AC:** Drag is throttled with rAF; position snaps to frame; playhead stays independent.
- *As an editor*, I can double‑click a keyframe to open a **Style Frame** modal.
  - **AC:** Modal shows “Style Frame (N)”; textarea placeholder; optional image upload button; Apply persists style note/ref to keyframe; shutter animation plays.

### 4.4 Playback
- *As a user*, I can play/pause and skip to previous/next keyframe.
  - **AC:** Skip selects that keyframe and enables delete; play reaches end and auto‑stops.

### 4.5 Camera Control
- *As a user*, I can orbit a 3D grid plane and see an XYZ gizmo.
  - **AC:** Visible receding grid; gizmo rotates with camera; presets (Orbit L/R, Dolly In, Crane Up) tween smoothly; tools for Position/Rotation/Zoom.

### 4.6 Shot Extension
- *As a user*, I can choose **Shot Extension** to add +5s to the timeline (cross‑hatched region) and change Generate → **Extend Shot**.
  - **AC:** Extended region is read‑only until confirmed (post‑MVP) or treated as display-only; returning to normal tools hides hatch.

### 4.7 Outputs
- *As a user*, I can expand **History** to see a 3×N grid of Outputs; star favorites.
  - **AC:** Star toggles immediately; items are draggable into canvas as video.

## 5. Functional Requirements
- **Drag & Drop:** supports `application/x-library` JSON and native files; sets image/video source; triggers shutter/droplet animations.
- **Keyframes:** array of `{id, frame, thumb?, styleNote?, styleRef?}`; frame is int; unique `id`.
- **Style Frame:** opens via toolbar button or double-click; Apply updates keyframe; Upload image attaches `styleRef`.
- **Timeline Rulers:** tick marks per second; dotted track; first/last bounds lines.
- **Models:** Fast (Turbo) vs Quality; clearly selected state.
- **Advanced Sliders:** Guidance, Steps, Denoise, Motion Weight, Camera Smooth, Variation, Motion Speed.

## 6. Non‑Functional Requirements
- **Performance:** UI updates within 16ms budget for drag; rAF smoothing for drags; minimal layout thrash.
- **A11y:** focus states on controls; labels for sliders and tools; hover titles.
- **Consistency:** baby‑blue outline `1px`, panel translucency, grid texture, font scale.
- **No external network icons build‑time:** use `lucide-react` local import; avoid CDN fallbacks.

## 7. Tech Notes
- **Stack:** React + Tailwind + shadcn/ui + lucide-react.
- **State:** local React state; consider Zustand/Redux post‑MVP.
- **Files:** `index.tsx` (component); assets are placeholders; no backend.
- **Known interactions:** rAF throttled drags; snap shutter overlay (ring + crosshair).

## 8. Data Shapes
```ts
type Keyframe = { id: number; frame: number; thumb?: string; styleNote?: string; styleRef?: string };
type GalleryItem = { id: number; thumb: string | null; title: string; duration: string; src: string };
type Camera = { yaw: number; pitch: number; roll: number };
```

## 9. Test Plan (Happy Paths)
- **Enhance Prompt:** given raw text → returns enriched template string.
- **Drag image file:** canvas shows image, Add Keyframe → ring/crosshair plays.
- **Add/Drag Keyframe:** diamond & thumbnail render, drag updates `frame` smoothly.
- **Style Frame:** double-click thumbnail → modal; Apply adds `styleNote`; badge appears.
- **Skip Keys:** with 3 keys at frames 0, 50, 100 → skip cycles and selects.
- **Shot Extension:** switching tool shows +5s hatched region; Generate label changes.

## 10. Risks & Open Questions
- Should Shot Extension region be **editable** or **read‑only** until confirm?
- Library persistence and uploads (post‑MVP)?
- Export formats (mp4/webm/gif) and server integration timeline?
- Undo/redo stack? Keyboard shortcuts (J/K/L; I/O; ←/→)?
