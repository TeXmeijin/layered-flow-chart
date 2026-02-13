# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code plugin that generates interactive, hierarchical flow diagrams as single-file HTML with drill-down navigation. Skill-only plugin — no build system, no package dependencies, no tests.

## What You'll Be Working On

Typical tasks: refine SKILL.md prompt logic, add/improve template.html UI features (shortcuts, animations, layout), update CDN dependencies, refine visual design.

## Key Files

- `skills/layered-flow-chart/SKILL.md` — Skill prompt definition. Edit this to change mode logic, SubAgent pipeline, data schema, or generation instructions.
- `skills/layered-flow-chart/assets/template.html` — The single-file HTML template. Edit this for UI features, keyboard shortcuts, styling, and component behavior.
- `docs/index.html` — GitHub Pages demo. **Must be regenerated** after template.html changes to keep the demo in sync (copy template structure, keep the demo's LEVELS data).

## Developing template.html

Self-contained React app with in-browser Babel. CDN deps from unpkg:
- `umd-react` (React + ReactDOM)
- `@babel/standalone`

To preview changes: `open skills/layered-flow-chart/assets/template.html` (uses the placeholder LEVELS data built into the template).

### Component Map

- `App` — Root. Manages `navStack` (breadcrumb/layer stack), popover, keyboard handler.
- `CanvasLayer` (memoized) — One canvas per level. Owns its own `nodeRefs` via `useRef({})`. **Do not add useEffect that clears nodeRefs** — each instance is independent.
- `Connections` — SVG bezier arrows. Positions calculated from DOM rects. Recalculates on resize + dual timeouts (600ms, 1000ms) for modal animation sync.
- `NodeCard` — Individual node with staggered entrance animation.
- `DetailPopover` — Leaf node detail panel with copy-to-markdown.

### Keyboard Navigation (vim-style)

Defined in `App`'s `useEffect` keydown handler. Current bindings: `h/j/k/l` spatial navigate, `o/Enter` open, `y` yank (copy as markdown), `q/Escape` close. `findNearest()` handles directional spatial lookup.

### Gotchas

- SVG marker IDs are scoped per level (`ah-${levelId}`, `ahw-${levelId}`, `ahb-${levelId}`) — without this, stacked layers share markers and arrows break.
- Connection paths use cubic bezier with horizontal/vertical heuristic (`|dx| >= |dy|`). Adding new connection styles needs to follow this convention.
- Depth 3+ works but modal width shrinks by `3%` per level — keep 2-3 levels as the design target.

## Updating SKILL.md

The skill defines a 3-phase SubAgent pipeline (Create mode), plus Update and Refine modes. When changing the data schema (node fields, connection properties), update both:
1. The schema section in SKILL.md
2. The template.html components that render those fields
