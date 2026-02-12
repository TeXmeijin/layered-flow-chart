---
name: layered-flow-chart
description: |
  Create, update, and refine interactive hierarchical flow diagrams as single-file HTML with drill-down navigation.
  Outputs a FigJam/Miro-like visual with stacking modal layers - clicking a node opens a deeper detail view.
  Use this skill when users ask to:
  - Visualize a processing flow, architecture, or pipeline as an interactive diagram
  - Create a layered/hierarchical flow chart with drill-down
  - Diagram a codebase flow with expandable detail levels
  - "Make a flow diagram of X" or "Visualize the X process"
  - Update an existing flow chart to reflect code changes
  - Improve or refine an existing flow chart (layout, detail, boundary connections)
  Triggers: "flow diagram", "flow chart", "process visualization", "layered chart", "interactive diagram", "drill-down diagram", "処理フロー図", "フローチャート", "フロー図解", "update flow", "refine flow", "フロー更新", "フロー改善"
---

# Layered Flow Chart

Create, update, and refine interactive hierarchical flow diagrams from a single HTML file. Nodes are clickable - drilling down opens stacking modal layers with progressively finer detail.

## Mode Selection

Before starting, determine which mode applies:

| Mode | Trigger | Existing HTML? | Code investigation? |
|------|---------|---------------|-------------------|
| **Create** | "Make a flow diagram of X" | No | Full (3-phase pipeline) |
| **Update** | "Update the flow to reflect latest code" | Yes | Targeted (diff-focused) |
| **Refine** | "Improve the layout / add details / add boundary arrows" | Yes | None or minimal |

**How to determine the mode:**
1. Check if user references an existing flow chart HTML file → if yes, **Update** or **Refine**
2. If user mentions code changes, new features, or syncing → **Update**
3. If user mentions layout, visuals, detail level, or adding properties like `boundary` → **Refine**
4. Otherwise → **Create**

---

## Create Mode (3-Phase SubAgent Pipeline)

This mode requires deep code investigation BEFORE building the HTML. To prevent shallow analysis, **you MUST split the work into 3 phases using SubAgents**. Do NOT skip phases or combine them.

### Phase 1: Investigation (Serial Explore SubAgents)

Investigation is done in **serial steps** using multiple Explore agents. Each step builds on the previous output. Do NOT parallelize - the layered nature of the chart requires understanding the high level before deciding what to drill into.

#### Step 1-1: Broad Survey (Explore)

Understand the overall flow at the highest abstraction level. This becomes the **root level** of the chart.

**Prompt template:**
```
Investigate the following flow/process in this codebase: {user's description}

Produce a HIGH-LEVEL overview report. Focus on the main stages/phases of the flow, NOT implementation details.

## Flow Overview
- Purpose: (one sentence)
- Entry point: (file:line)
- Overall pattern: (e.g., pipeline, event-driven, request-response)

## Root Level Steps (the main stages):
For each major stage (aim for 5-10):
1. **{Stage Name}**
   - Role: {what this stage does, one sentence}
   - Key file(s): {primary file(s) involved}
   - Complexity: simple | moderate | complex
   - Branches to: {next stage(s), if any}

## Connections:
- {StageA} -> {StageB} (label if conditional)
- {StageA} -> {StageC} [dashed, on failure]

Focus on identifying WHAT the stages are and HOW they connect. Do not drill into implementation details yet.
```

#### Main Agent Review (between steps)

After Step 1-1, review the output and decide:
- Which stages are "complex" or critical enough to warrant a drill-down level?
- Are there stages that were missed or should be split/merged?
- Select **2-4 stages** for deep investigation in Step 1-2.

#### Step 1-2: Deep Dive (Explore)

Investigate the selected stages in detail. These become the **drill-down levels** of the chart.

**Prompt template:**
```
I am investigating this flow: {user's description}

Here is the high-level overview already produced:
{paste Step 1-1 output}

Now deep-dive into these specific stages: {list of selected stages}

For EACH stage, produce a detailed sub-flow:

### Stage: {name}
#### Sub-steps:
1. **{Sub-step Name}**
   - Role: {what it does}
   - Key file(s): {file:line-range}
   - Tech: {libraries/frameworks involved}
   - Input: {what it receives}
   - Output: {what it produces}
   - Branches to: {next sub-step(s), if any}
   - Notes: {error handling, edge cases, important details}

#### Connections:
- {SubStepA} -> {SubStepB}

Investigate EVERY file involved. List concrete function names, file paths, and line numbers. Aim for 4-8 sub-steps per stage.
```

#### Step 1-3 (Optional): Revise Root Level

If the deep dive revealed that the root level needs corrections (missing stages, wrong connections, stages that should be split), spawn one more **Explore** agent to verify and patch.

**Prompt template:**
```
Here is a high-level flow overview:
{Step 1-1 output}

And here are the deep-dive findings:
{Step 1-2 output}

Based on the deep-dive, does the high-level overview need corrections?
Check for:
- Missing stages that the deep-dive revealed
- Stages that should be split or merged
- Connections that are wrong or missing
- Stages marked as simple that are actually complex (or vice versa)

Output ONLY the corrections needed (or "No corrections needed"). Use the same format as the original overview for any additions/changes.
```

### Phase 2: Data Construction (SubAgent: general-purpose)

Spawn a **general-purpose** agent. Pass it the Phase 1 report AND the Data Schema section below. The agent constructs the `LEVELS` JavaScript object.

**Prompt template:**
```
Convert the following investigation report into a LEVELS JavaScript object for a flow chart.

## Investigation Report
{paste Step 1-1 output (with Step 1-3 corrections applied if any)}

## Deep Dive Report
{paste Step 1-2 output}

## Schema Rules
{paste the "Data Schema", "Node Positioning Guide", "Connection Path Collision Prevention", and "Color Palette Suggestions" sections from this SKILL.md}

Output ONLY the JavaScript code block:
- const LEVELS = { ... };
- const HEADER_LOGO = '...';
- const TITLE = '...';

Requirements:
- Follow the Node Positioning Guide strictly - space nodes to avoid overlap
- Trace EVERY connection path to verify no node collision (see Collision Prevention)
- Choose colors from the palette based on node purpose
- Set hasChildren: true for nodes that have matching sub-levels
- Include file references, techs, input/output, and details where available
- Aim for 5-10 nodes per level. If the investigation found fewer, that's fine, but do not drop discovered steps
```

### Phase 3: Assembly (Main Agent)

You (the main agent) handle the final assembly:

1. **Copy template** from `~/.claude/skills/layered-flow-chart/assets/template.html` to `/tmp/{project}/flow-{name}.html`
2. **Replace the `LEVELS` object, `HEADER_LOGO`** with Phase 2 output
3. **Replace the `<title>` tag** text
4. **Open in browser**: `open /tmp/{project}/flow-{name}.html`
5. **Verify** with screenshots at each layer depth - click through every drill-down level

---

## Update Mode (Sync with Code Changes)

Use when an existing flow chart HTML needs to reflect code changes (new features, refactored modules, removed endpoints, etc.).

### Step 0: Extract Current State

1. **Read the existing HTML file** to extract the current `LEVELS` object
2. Parse it to understand: which nodes exist, their hierarchy, connections, and metadata

### Step 1: Targeted Investigation (Explore)

Spawn an **Explore** agent focused on **what changed**, not the entire codebase.

**Prompt template:**
```
An existing flow chart describes this process: {brief description}

Here are the current nodes and connections in the chart:
{paste extracted LEVELS summary - just node IDs, titles, and file references}

The user says the following has changed: {user's description of changes}

Investigate the codebase and report:
1. **New steps** that should be added (with file:line, role, connections)
2. **Removed steps** that no longer exist in the code
3. **Modified steps** where the role, file, tech, or connections changed
4. **Connection changes** (new, removed, or changed connections)

For each change, provide the same detail level as the existing nodes (file paths, tech, input/output).
Only report actual changes - do not re-describe unchanged parts.
```

### Step 2: Apply Changes (Main Agent or general-purpose SubAgent)

Based on the diff report:
1. **Add** new nodes/levels to the LEVELS object (assign positions that avoid collisions)
2. **Remove** deleted nodes and their connections
3. **Modify** changed nodes (update titles, descriptions, files, techs, connections)
4. **Re-check positions** - adding/removing nodes may require repositioning to maintain spacing
5. **Update `boundary` flags** if new network crossings were introduced

### Step 3: Write and Verify

1. **Edit the existing HTML file** in-place (replace LEVELS object only)
2. **Open in browser** and verify all layers

---

## Refine Mode (Improve Existing Chart)

Use when the chart's content is correct but the presentation needs improvement. No or minimal code investigation.

**CRITICAL: Always refine the surrounding context, not just the target.**

When a user asks to refine a specific module, you MUST also review and potentially revise its **surrounding layers**:

```
Parent Layer (the level containing the target node)
  ├── Sibling nodes: are they at the same resolution as the refined target?
  ├── Connections: do arrow counts and labels still make sense?
  └── Grouping: should siblings be split/merged to match the new granularity?

Target Node (what the user asked to refine)
  └── The node itself + its drill-down level if it has one

Child Layer (the drill-down of the target, if any)
  ├── Sub-nodes: does the internal structure match the refined understanding?
  └── Connections back to parent: are input/output descriptions consistent?
```

**Why this matters:** Refining one module often reveals that:
- Adjacent nodes were too coarse or too fine compared to the refined target → split or merge them
- Connections between the target and its neighbors need new arrows, labels, or `boundary` flags
- The parent layer's node count needs adjustment (e.g., what was 1 node should be 3)
- Drill-down levels of adjacent nodes need similar resolution increases

### Step 0: Read and Scope the Blast Radius

1. **Read the existing HTML file** to extract the current `LEVELS` object
2. Identify the **target node** the user wants to refine
3. Identify the **impact zone** — all layers/nodes that may need revision:
   - The level containing the target (parent layer)
   - The drill-down of the target (child layer), if any
   - Nodes directly connected to the target (upstream/downstream neighbors)
   - Drill-downs of those neighbors, if the resolution gap is large

### Step 0.5: Confirm Scope with User

Before proceeding, **use AskUserQuestion** to confirm the refine scope with the user. Present the identified impact zone and let them choose.

**Example question:**
```
「{target node}」の改善にあたり、影響範囲を確認させてください。

1. Target only — 指定ノードとそのドリルダウンのみ
2. Target + neighbors — 前後のノード・接続も見直す（推奨）
3. Full layer review — 対象レイヤー全体のノード数・粒度・接続を再構成
4. (Other — 自由記述)
```

This prevents over-engineering a simple label fix, while ensuring the user is aware when broader changes are recommended.

### Step 1: Assess Granularity Balance

For each node in the impact zone, check:
- **Resolution parity**: Is this node at a similar level of detail as the refined target? If the target now has 6 sub-steps in its drill-down but a neighbor is still a single vague box, the neighbor needs attention.
- **Connection accuracy**: Do the arrows entering/leaving this node still represent the actual data flow? Are there missing arrows or stale labels?
- **Boundary flags**: Should any connections be marked `boundary: true` that weren't before?

### Step 2: Apply Changes

For each layer in the impact zone:
1. **Add/split nodes** where granularity is too coarse relative to the refined target
2. **Merge/simplify nodes** where granularity is unnecessarily fine
3. **Update connections** — add missing arrows, remove stale ones, update labels and `boundary` flags
4. **Reposition nodes** — adding/removing nodes requires recalculating positions across the entire level (not just the changed nodes)
5. **Update drill-down levels** — if a node was split, its old drill-down may need to be split too; if merged, drill-downs may need consolidation

### Common Refinements

| Request | Action | Impact zone |
|---------|--------|-------------|
| "Add boundary connections" | Add `boundary: true` to cross-network connections | All levels |
| "Improve layout" | Recalculate positions, fix collisions | All levels |
| "Add more detail to X" | Enrich X + check neighbor resolution parity | Parent + child + neighbors |
| "Add a drill-down for X" | New level + set `hasChildren` + check if neighbors need drill-downs too | Parent + new child |
| "Fix overlapping arrows" | Reposition per Collision Prevention | Affected level |

### Step 3: Write and Verify

1. **Edit the existing HTML file** in-place (modify LEVELS object only)
2. **Open in browser** and verify **every layer in the impact zone**, not just the target

---

## Data Schema

The `LEVELS` object is a flat map. Key = level ID, value = level definition.

```js
const LEVELS = {
  root: { ... },        // Required. Entry point.
  'node-id': { ... },   // Sub-level for a node with hasChildren: true
};
```

### Level Definition

```js
{
  title: 'Level Title',
  description: 'Subtitle text',
  nodes: [ /* Node[] */ ],
  connections: [ /* Connection[] */ ],
}
```

### Node

```js
{
  id: 'unique-id',           // Must match LEVELS key if hasChildren: true
  title: 'Node Title',       // Supports \n for line breaks
  description: 'Short desc',
  icon: 'emoji-or-letter',   // Single emoji or character
  color: '#3B82F6',          // Accent color (hex)
  x: 50,                     // Horizontal position (0-100%)
  y: 50,                     // Vertical position (0-100%)
  techs: ['React', 'API'],   // Tech badges (optional)
  file: 'src/foo.ts:10-20',  // Source file reference (optional)
  hasChildren: true,          // true = clicking drills down (needs matching LEVELS entry)
  // Popover fields (shown on click for leaf nodes):
  input: 'Request body',     // (optional)
  output: 'JSON response',   // (optional)
  details: ['point 1', ...], // Bullet list (optional)
  annotation: true,           // Yellow dashed style, non-clickable (optional)
}
```

### Connection

```js
{ from: 'node-a', to: 'node-b' }                                      // Default gray arrow
{ from: 'node-a', to: 'node-b', dashed: true, label: 'on failure' }   // Dashed yellow + label
{ from: 'node-a', to: 'node-b', boundary: true, label: 'HTTP' }       // Thick indigo arrow (network boundary)
```

### Boundary Connections (Network / Process Boundary)

Use `boundary: true` for connections that **cross a network or process boundary**. These render as thick indigo (#6366f1) arrows with bold labels, making architecture boundaries immediately visible.

**When to use:**
- Client → Server (browser → API route)
- API route → Backend service (HTTP/gRPC)
- Backend → Database (TCP/SQL)
- Service → External API (HTTP)
- Any cross-process / cross-host communication

**When NOT to use** (keep default gray):
- Function calls within the same process
- Component → Component in the same runtime
- Internal module references

**Typical label examples:** `HTTP`, `gRPC`, `SQL`, `WebSocket`, `fetch`, `REST`, `GraphQL`

## Node Positioning Guide

- `x` / `y` are percentages (0-100) of the canvas. Node is centered at that point.
- Linear flow: evenly space `x` values, same `y` (e.g., x: 15/40/65/90, y: 50)
- Fan-in/fan-out: stack `y` values on one side, converge to single point on other
- Branching: same `x`, different `y` for branches (e.g., y: 28 and y: 72)
- Keep 15-20% minimum spacing between nodes to avoid overlap

### Connection Path Collision Prevention (IMPORTANT)

Bezier curves are auto-drawn between nodes. Before finalizing positions, **mentally trace every connection path** to ensure no node sits on the path:

- **Horizontal connections** (|dx| >= |dy|): curve exits from the right/left edge of the source, enters the left/right edge of the target. The curve bows vertically at the midpoint.
- **Vertical connections** (|dy| > |dx|): curve exits from the top/bottom edge, enters the bottom/top of the target. The curve bows horizontally at the midpoint.
- **Fan-out (1→N)**: When a node connects to multiple targets, list all target positions first, then verify that NO other node sits in the rectangular region between source and each target. If a conflict exists, move the blocking node out of the path.
- **Cross-layer connections**: If node A (bottom-left) connects to node B (top-right), the bezier will sweep through the center area. Do not place unrelated nodes in that sweep zone.
- **Practical check**: For every connection, imagine a thick band from source edge to target edge. If any node overlaps that band, adjust positions until clear.

## Color Palette Suggestions

| Use Case     | Hex       |
|-------------|-----------|
| Input/UI    | `#3B82F6` |
| Storage     | `#F59E0B` |
| Auth/API    | `#EF4444` |
| Processing  | `#8B5CF6` |
| Display     | `#10B981` |
| Save/Output | `#14B8A6` |
| Warning     | `#F59E0B` |

## Key Implementation Notes

- **Do NOT modify CSS or React component code** in the template - only replace the DATA SECTION
- Each `CanvasLayer` manages its own `nodeRefs` - do not add `useEffect` that clears refs
- SVG marker IDs are scoped per level (`ah-${levelId}`) to avoid conflicts
- Connection arrows recalculate on resize + dual timeouts (600ms, 1000ms) for animation sync
- Depth 3+ works but modals become narrow - 2-3 levels is the sweet spot
