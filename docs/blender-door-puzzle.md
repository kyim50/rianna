# Blender -> Door Puzzle (Blueprint-Style Overlap Triggers)

This portfolio demo loads a Blender-exported `.glb` and registers **overlap events** by checking whether a player proxy (a small sphere) intersects **named trigger volumes**.

## Required naming conventions
Name objects (or their parents) using these prefixes:

- Trigger volumes: `TRIGGER_<KEY>`
  - Example: `TRIGGER_A`, `TRIGGER_B`, `TRIGGER_C`
  - Best practice: use simple **box mesh** objects for triggers.

- Lights / emissive targets: `LIGHT_<KEY>`
  - Example: `LIGHT_A`, `LIGHT_B`, `LIGHT_C`
  - The demo will try to change `emissive` (preferred for PBR materials) and will fall back to `color` if emissive is not available.

- Door mesh/group: `DOOR_<NAME>`
  - Example: `DOOR_MAIN`
  - The demo rotates door meshes around the Y axis when unlocked.

## Blender setup checklist
1. Make sure trigger volumes are exportable meshes (not just empties).
2. Keep triggers axis-aligned boxes if possible (they’ll map nicely to `Box3` overlap tests).
3. Assign emissive-capable materials to `LIGHT_*` objects (e.g., Principled BSDF with Emission enabled).
4. Ensure names are set exactly (case-sensitive in the demo).

## Export settings (Blender)
Use **File -> Export -> glTF 2.0 (.glb)** with:

- Format: `glb`
- Apply modifiers: enabled
- Include: custom properties (if available in your Blender version)
- Triangulate (optional, but can help with consistent geometry)

## How the demo maps objects
- `TRIGGER_A` overlaps will attempt to recolor `LIGHT_A`.
- If no `LIGHT_<KEY>` exists, the demo recolors all `LIGHT_*` in the scene as a fallback.
- The door unlocks after activating all required triggers (by default: `A`, `B`, `C`, if present).

## Where to place your export
Export your `.glb` to:

`rianna/public/models/playrix_door_puzzle.glb`

Then reload the portfolio page.

